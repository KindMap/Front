interface ImportMetaEnv {
  // Vite 기본 변수를 포함할 수 있습니다.
  readonly VITE_APP_TITLE: string;

  // 환경변수 정의
  VITE_GOOGLE_MAPS_API_KEY: "AIzaSyAvx8bGk5wtq5tTOE5q2S06SkLZJakUItM";
  VITE_WS_BASE_URL: "ws://35.92.117.143:8001";
  VITE_API_BASE_URL: "http://35.92.117.143:8001";
  // 추가될 경우 해당 파일에도 정의 필요
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
