# Catus API 명세

| 버전 | HTML | Markdown | 상태 |
| --- | --- | --- | --- |
| v1 | [명세 열기](v1/index.html) | [원문](v1/gromo-api-spec.md) | 0.8-proposed · 백엔드 협의안 · 미정 정책 포함 |

## 원본 관계

- `v1/gromo-api-spec.md`가 planning-document 안의 단일 수정 원본이다.
- R61 화면별 API 스펙을 본문으로 사용하고, 도메인별 백엔드 전달 메모에서 구체적인 권한·해금·오류 코드·읽기 모델 제안을 흡수했다.
- 원래 두 문서는 참고 자료로만 남긴다. 이후 수정은 이 원본에서 하고, 합의되지 않은 계약은 `제안` 또는 `미정 정책`으로 표시한다.
- 이 문서는 목표 계약 협의안이며 현재 운영 API의 OpenAPI/Swagger 명세를 대체하거나 구현 완료를 증명하지 않는다.

## 수정

v1은 `v1/gromo-api-spec.md`를 수정한 뒤 저장소 루트에서 다음 명령으로 HTML을 갱신한다.

```sh
python3 scripts/render-api-spec.py
npm run check
npm test
npm run build
```

계약을 대체하는 새 버전은 `v2/`처럼 별도 폴더에 추가하고, 이 목록과 저장소 README의 최신 버전 링크를 갱신한다.
