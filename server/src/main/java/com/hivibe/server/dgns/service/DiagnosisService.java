package com.hivibe.server.dgns.service;

import com.hivibe.server.domain.entity.Anls;
import com.hivibe.server.domain.entity.Dgns;
import com.hivibe.server.domain.entity.OptCd;
import com.hivibe.server.domain.entity.OrnCd;
import com.hivibe.server.domain.entity.User;
import com.hivibe.server.dgns.dto.DiagnosisDetailDto;
import com.hivibe.server.dgns.dto.DiagnosisListItemDto;
import com.hivibe.server.dgns.dto.DiagnosisSaveRequestDto;
import com.hivibe.server.repository.AnlsRepository;
import com.hivibe.server.repository.DgnsRepository;
import com.hivibe.server.repository.OptCdRepository;
import com.hivibe.server.repository.OrnCdRepository;
import com.hivibe.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiagnosisService {

    private final OrnCdRepository ornCdRepository;
    private final AnlsRepository anlsRepository;
    private final OptCdRepository optCdRepository;
    private final DgnsRepository dgnsRepository;
    private final UserRepository userRepository;

    @Transactional
    public Long saveDiagnosis(String lgnId, DiagnosisSaveRequestDto request) {

        User user = userRepository.findByLgnId(lgnId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없어요."));

        // 1. 원본 코드 저장
        OrnCd ornCd = OrnCd.builder()
                .cdName(request.name())
                .lang(request.lang())
                .stbltYn(request.isStable())
                .cdCn(request.content())
                .build();
        OrnCd savedOrnCd = ornCdRepository.save(ornCd);

        // 2. 분석 결과 저장
        Anls anls = Anls.builder()
                .ornCd(savedOrnCd)
                .cdGrd(request.grade())
                .cdScr(request.score())
                .cdEfcn(String.valueOf(request.efficiency()))
                .cdRead(String.valueOf(request.readability()))
                .cdSytle(String.valueOf(request.style()))
                .timeComp(request.timeComplexity())
                .cdEfcnRsn(request.efficiencyReason())
                .cdAccRsn(request.accuracyReason())
                .cdReadRsn(request.readabilityReason())
                .cdStyleRsn(request.styleReason())
                .aiSummry(request.summary())
                .build();
        Anls savedAnls = anlsRepository.save(anls);

        // 3. 최적화 코드 저장
        OptCd optCd = OptCd.builder()
                .anls(savedAnls)
                .lang(request.lang())
                .cdCn(request.optimizedCode())
                .timeComp(request.timeComplexity())
                .build();
        optCdRepository.save(optCd);

        // 4. 진단 이력 저장 (User ↔ Anls 연결, 뱃지 계산용)
        Dgns dgns = Dgns.builder()
                .user(user)
                .anls(savedAnls)
                .dgnsNm(request.name())
                .build();
        dgnsRepository.save(dgns);

        return savedAnls.getAnlsId();
    }

    /** 내 진단 목록 (최신순) — "이전 분석에서 불러오기" 용 */
    public List<DiagnosisListItemDto> getMyDiagnoses(String lgnId) {
        System.out.println("=== getMyDiagnoses 호출됨: " + lgnId);
        User user = getUser(lgnId);
        return dgnsRepository.findByUser_IdOrderByDgnsDtDesc(user.getId())
                .stream()
                .map(DiagnosisListItemDto::new)
                .collect(Collectors.toList());
    }

    /** 진단 단건 상세 (원본 코드 포함) — 선택 시 에디터에 불러오기 용 */
    public DiagnosisDetailDto getDiagnosisDetail(String lgnId, Long dgnsId) {
        User user = getUser(lgnId);
        Dgns dgns = dgnsRepository.findByDgnsIdAndUser_Id(dgnsId, user.getId())
                .orElseThrow(() -> new RuntimeException("진단 기록을 찾을 수 없어요."));
        return new DiagnosisDetailDto(dgns);
    }

    private User getUser(String lgnId) {
        return userRepository.findByLgnId(lgnId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없어요."));
    }
}