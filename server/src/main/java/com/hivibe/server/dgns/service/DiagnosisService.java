package com.hivibe.server.dgns.service;

import com.hivibe.server.domain.entity.Anls;
import com.hivibe.server.domain.entity.Dgns;
import com.hivibe.server.domain.entity.Lrn;
import com.hivibe.server.domain.entity.OptCd;
import com.hivibe.server.domain.entity.OrnCd;
import com.hivibe.server.domain.entity.User;
import com.hivibe.server.domain.enums.UserGrd;
import com.hivibe.server.dgns.dto.DiagnosisDetailDto;
import com.hivibe.server.dgns.dto.DiagnosisListItemDto;
import com.hivibe.server.dgns.dto.DiagnosisSaveRequestDto;
import com.hivibe.server.dgns.dto.DiagnosisSaveResponseDto;
import com.hivibe.server.repository.AnlsRepository;
import com.hivibe.server.repository.DgnsRepository;
import com.hivibe.server.repository.OptCdRepository;
import com.hivibe.server.repository.OrnCdRepository;
import com.hivibe.server.repository.UserRepository;
import com.hivibe.server.user.dto.TierUpDto;
import com.hivibe.server.user.service.UserGrdService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hivibe.server.repository.LrnRepository;
import com.hivibe.server.repository.LrnBlankRepository;
import com.hivibe.server.repository.LrnSubmRepository;
import com.hivibe.server.repository.ConceptRepository;

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
        private final LrnRepository lrnRepository;
        private final LrnBlankRepository lrnBlankRepository;
        private final LrnSubmRepository lrnSubmRepository;
        private final ConceptRepository conceptRepository;
        private final UserGrdService userGrdService;

        @Transactional
        public DiagnosisSaveResponseDto saveDiagnosis(String lgnId, DiagnosisSaveRequestDto request) {

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
                OptCd savedOptCd = optCdRepository.save(optCd);

                // 4. 진단 이력 저장
                Dgns dgns = Dgns.builder()
                                .user(user)
                                .anls(savedAnls)
                                .dgnsNm(request.name())
                                .build();
                Dgns savedDgns = dgnsRepository.save(dgns);
                
                // 5. 사용자 등급 재계산
                dgnsRepository.flush();
                
                UserGrd upgraded = userGrdService.recalculate(user.getId());

                return new DiagnosisSaveResponseDto(
                                savedAnls.getAnlsId(),
                                savedOrnCd.getOrnCdId(),
                                savedOptCd.getOptCdId(),
                                savedDgns.getDgnsId(),
                                upgraded == null ? null : TierUpDto.from(upgraded));
        }

        @Transactional(readOnly = true)
        /** 내 진단 목록 (최신순) — "이전 분석에서 불러오기" 용 */
        public List<DiagnosisListItemDto> getMyDiagnoses(String lgnId) {
                System.out.println("=== getMyDiagnoses 호출됨: " + lgnId);
                User user = getUser(lgnId);
                return dgnsRepository.findByUser_IdOrderByDgnsDtDesc(user.getId())
                                .stream()
                                .map(DiagnosisListItemDto::new)
                                .collect(Collectors.toList());
        }

        public DiagnosisDetailDto getDiagnosisDetail(String lgnId, Long dgnsId) {
                User user = getUser(lgnId);
                Dgns dgns = dgnsRepository.findByDgnsIdAndUser_Id(dgnsId, user.getId())
                                .orElseThrow(() -> new RuntimeException("진단 기록을 찾을 수 없어요."));

                // OptCd 따로 조회
                String optimizedCode = optCdRepository
                                .findByAnls_AnlsId(dgns.getAnls().getAnlsId())
                                .map(opt -> opt.getCdCn())
                                .orElse("");

                return new DiagnosisDetailDto(dgns);
        }

        private User getUser(String lgnId) {
                return userRepository.findByLgnId(lgnId)
                                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없어요."));
        }

        // 메서드 추가
        @Transactional
        public void deleteDiagnosis(String lgnId, Long dgnsId) {
                User user = getUser(lgnId);
                Dgns dgns = dgnsRepository.findByDgnsIdAndUser_Id(dgnsId, user.getId())
                                .orElseThrow(() -> new RuntimeException("진단 기록을 찾을 수 없어요."));

                Anls anls = dgns.getAnls();
                OrnCd ornCd = anls.getOrnCd();

                // 1. Dgns 먼저 삭제
                dgnsRepository.delete(dgns);

                // 2. 연결된 Lrn 관련 전부 삭제
                List<Lrn> lrns = lrnRepository.findByOptCd_Anls_AnlsId(anls.getAnlsId());
                for (Lrn lrn : lrns) {
                        lrnSubmRepository.deleteByLrnId(lrn.getLrnId());
                        lrnBlankRepository.deleteByLrnId(lrn.getLrnId());
                        conceptRepository.deleteByLrnId(lrn.getLrnId());
                        lrnRepository.delete(lrn);
                }

                // 3. OptCd → Anls → OrnCd 순서로 삭제
                optCdRepository.findByAnls_AnlsId(anls.getAnlsId())
                                .ifPresent(optCdRepository::delete);
                anlsRepository.delete(anls);
                ornCdRepository.delete(ornCd);

                // 사용자 등급 재계산
                dgnsRepository.flush();
                userGrdService.recalculate(user.getId());
        }
}