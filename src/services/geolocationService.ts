export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export class GeolocationService {
  private watchId: number | null = null;
  private onPositionUpdate: ((position: GeolocationPosition) => void) | null =
    null;
  private lastUpdateTime: number = 0;
  private updateInterval: number = 2000; // 2초

  /**
   * 위치 추적 시작
   * @param callback - 위치 업데이트 콜백
   * @param intervalMs - 업데이트 간격 (기본 2초)
   */
  startWatching(
    callback: (position: GeolocationPosition) => void,
    intervalMs: number = 2000
  ): void {
    if (!navigator.geolocation) {
      throw new Error("Geolocation을 지원하지 않는 브라우저입니다");
    }

    this.updateInterval = intervalMs;
    this.onPositionUpdate = callback;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();

        // 지정된 간격마다만 업데이트
        if (now - this.lastUpdateTime >= this.updateInterval) {
          const geoPosition: GeolocationPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          console.log("[Geolocation] 위치 업데이트:", geoPosition);

          if (this.onPositionUpdate) {
            this.onPositionUpdate(geoPosition);
          }

          this.lastUpdateTime = now;
        }
      },
      (error) => {
        console.error("[Geolocation] 위치 추적 에러:", error);
        this.handleError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );

    console.log(
      "[Geolocation] 위치 추적 시작 (간격:",
      this.updateInterval,
      "ms)"
    );
  }

  /**
   * 위치 추적 중지
   */
  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.lastUpdateTime = 0;
      console.log("[Geolocation] 위치 추적 중지");
    }
  }

  /**
   * 현재 위치 한 번만 가져오기
   */
  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation을 지원하지 않는 브라우저입니다"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geoPosition: GeolocationPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          console.log("[Geolocation] 현재 위치:", geoPosition);
          resolve(geoPosition);
        },
        (error) => {
          console.error("[Geolocation] 현재 위치 가져오기 실패:", error);
          reject(this.getErrorMessage(error));
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * 위치 추적 중인지 확인
   */
  isWatching(): boolean {
    return this.watchId !== null;
  }

  /**
   * 에러 핸들링
   */
  private handleError(error: GeolocationPositionError): void {
    const errorMessage = this.getErrorMessage(error);
    console.error("[Geolocation] 에러:", errorMessage);
    // 에러 이벤트를 외부로 전달하려면 콜백 추가 가능
  }

  /**
   * 에러 메시지 생성
   */
  private getErrorMessage(error: GeolocationPositionError): Error {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return new Error(
          "위치 정보 접근 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요."
        );
      case error.POSITION_UNAVAILABLE:
        return new Error(
          "위치 정보를 사용할 수 없습니다. GPS가 켜져 있는지 확인해주세요."
        );
      case error.TIMEOUT:
        return new Error(
          "위치 정보 요청 시간이 초과되었습니다. 다시 시도해주세요."
        );
      default:
        return new Error(
          "위치 정보를 가져오는 중 알 수 없는 오류가 발생했습니다."
        );
    }
  }

  /**
   * 서울 수도권 범위 내인지 확인
   * @param latitude - 위도
   * @param longitude - 경도
   * @returns 서울 수도권 범위 내이면 true
   */
  static isInSeoulMetroArea(latitude: number, longitude: number): boolean {
    return (
      latitude >= 36.0 &&
      latitude <= 39.0 &&
      longitude >= 126.4 &&
      longitude <= 127.6
    );
  }

  /**
   * GPS 정확도가 충분한지 확인
   * @param accuracy - 정확도 (미터)
   * @param threshold - 임계값 (기본 100m)
   * @returns 정확도가 충분하면 true
   */
  static isAccuracyGood(accuracy: number, threshold: number = 100): boolean {
    return accuracy <= threshold;
  }
}
