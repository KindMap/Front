interface ImportMetaEnv {
  // Vite 기본 변수를 포함할 수 있습니다.
  readonly VITE_APP_TITLE: string;

  // 환경변수 정의
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_WS_BASE_URL: string;
  readonly VITE_API_BASE_URL: string;
  // 추가될 경우 해당 파일에도 정의 필요
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
