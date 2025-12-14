/**
 * Audio Recorder Service
 * MediaRecorder API를 사용한 음성 녹음 서비스
 */

export interface AudioRecorderConfig {
  maxDuration?: number; // 최대 녹음 시간 (ms)
  maxFileSize?: number; // 최대 파일 크기 (bytes)
  sampleRate?: number; // 샘플레이트 (Hz)
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  private maxDuration: number;
  private maxFileSize: number;
  private sampleRate: number;
  private recordingTimer: NodeJS.Timeout | null = null;

  constructor(config: AudioRecorderConfig = {}) {
    this.maxDuration = config.maxDuration || 10000; // 10초
    this.maxFileSize = config.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.sampleRate = config.sampleRate || 16000; // 16kHz
  }

  /**
   * 브라우저가 음성 녹음을 지원하는지 확인
   */
  static checkSupport(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  }

  /**
   * 지원되는 MIME 타입 찾기
   */
  static getSupportedMimeType(): string | null {
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4'
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }

    return null;
  }

  /**
   * 마이크 권한 요청
   */
  async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.sampleRate,
          channelCount: 1, // mono
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // 권한 확인 후 스트림 정리
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('[AudioRecorder] 마이크 권한 거부:', error);
      return false;
    }
  }

  /**
   * 녹음 시작
   */
  async startRecording(): Promise<void> {
    if (!AudioRecorder.checkSupport()) {
      throw new Error('브라우저가 음성 녹음을 지원하지 않습니다');
    }

    const mimeType = AudioRecorder.getSupportedMimeType();
    if (!mimeType) {
      throw new Error('지원되는 오디오 포맷이 없습니다');
    }

    try {
      // 마이크 스트림 가져오기
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // MediaRecorder 생성
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        audioBitsPerSecond: 128000
      });

      this.audioChunks = [];
      this.startTime = Date.now();

      // 데이터 수집
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // 녹음 시작
      this.mediaRecorder.start(100); // 100ms마다 데이터 수집

      // 최대 녹음 시간 타이머 설정
      this.recordingTimer = setTimeout(() => {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          console.log('[AudioRecorder] 최대 녹음 시간 도달, 자동 정지');
          this.stopRecording().catch(console.error);
        }
      }, this.maxDuration);

      console.log('[AudioRecorder] 녹음 시작:', mimeType);
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  /**
   * 녹음 정지 및 Base64 반환
   */
  async stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        reject(new Error('녹음이 시작되지 않았습니다'));
        return;
      }

      // 타이머 정리
      if (this.recordingTimer) {
        clearTimeout(this.recordingTimer);
        this.recordingTimer = null;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          // Blob 생성
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });

          // 파일 크기 체크
          if (audioBlob.size > this.maxFileSize) {
            throw new Error(`파일 크기가 너무 큽니다 (${(audioBlob.size / 1024 / 1024).toFixed(2)}MB)`);
          }

          // 무음 체크 (파일이 너무 작으면 무음일 가능성)
          if (audioBlob.size < 1000) { // 1KB 미만
            throw new Error('음성이 감지되지 않았습니다');
          }

          // Base64 변환
          const base64 = await this.blobToBase64(audioBlob);

          console.log('[AudioRecorder] 녹음 완료:', {
            size: `${(audioBlob.size / 1024).toFixed(2)}KB`,
            duration: `${((Date.now() - this.startTime) / 1000).toFixed(1)}s`,
            mimeType
          });

          this.cleanup();
          resolve(base64);
        } catch (error) {
          this.cleanup();
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * 녹음 취소
   */
  cancelRecording(): void {
    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
      this.recordingTimer = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    this.cleanup();
    console.log('[AudioRecorder] 녹음 취소됨');
  }

  /**
   * 현재 녹음 시간 (ms)
   */
  getRecordingDuration(): number {
    if (this.startTime === 0) {
      return 0;
    }
    return Date.now() - this.startTime;
  }

  /**
   * 녹음 중인지 확인
   */
  isRecording(): boolean {
    return this.mediaRecorder !== null && this.mediaRecorder.state === 'recording';
  }

  /**
   * Blob을 Base64로 변환
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // "data:audio/webm;base64," 부분 제거
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * 리소스 정리
   */
  private cleanup(): void {
    // MediaStream 정리
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    // MediaRecorder 정리
    if (this.mediaRecorder) {
      this.mediaRecorder.ondataavailable = null;
      this.mediaRecorder.onstop = null;
      this.mediaRecorder = null;
    }

    this.audioChunks = [];
    this.startTime = 0;

    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
      this.recordingTimer = null;
    }
  }
}
