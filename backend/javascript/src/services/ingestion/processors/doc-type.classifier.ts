import { Injectable } from '@nestjs/common';
import { DocType } from "../../models/raw-document";

/**
 * [문서 타입 분류기]
 * 
 * 파일 저장 경로를 보고 해당 문서가 어떤 성격(adr, runbook, api 등)을 
 * 가지는지 판단해줍니다.
 */
@Injectable()
export class DocTypeClassifier {
    /**
     * 경로 문자열을 분석하여 문서 카테고리를 반환합니다.
     */
    classify(filePath: string): DocType {
        // Windows 환경(\)과 Linux 환경(/) 모두 대응하기 위해 슬래시를 /로 통일합니다.
        const p = filePath.toLowerCase().replace(/\\/g, '/');

        // 경로에 포함된 특정 키워드로 타입을 결정하는 간단한 규칙입니다.
        if (p.includes('/runbook/')) return 'runbook';
        if (p.includes('/adr/')) return 'adr';
        if (p.includes('/api/')) return 'api';
        if (p.includes('/policy/')) return 'policy';
        if (p.includes('/ingestion/')) return 'ingestion';
        if (p.includes('/manual/')) return 'manual';

        // 분류할 수 없는 경우 기본값을 반환합니다.
        return 'manual';
    }
}