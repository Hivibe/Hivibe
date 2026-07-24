package com.hivibe.server.review.service;

import com.hivibe.server.domain.entity.RvwSched;
import com.hivibe.server.review.dto.ReviewResponseDto;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;

@Slf4j
@Service
public class RvwMailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final String from;
    private final String baseUrl;

    public RvwMailService(JavaMailSender mailSender,
                          SpringTemplateEngine templateEngine,
                          @Value("${app.mail.from}") String from,
                          @Value("${app.frontend-url}") String baseUrl) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
        this.from = from;
        this.baseUrl = baseUrl;
    }

    public void sendReviewMail(RvwSched sched) throws Exception {
        String to = sched.getUser().getUserEmail();
        if (to == null || to.isBlank()) {
            throw new IllegalStateException(
                    "수신 이메일이 없습니다. userId=" + sched.getUser().getId());
        }

        String lrnName = resolveLrnName(sched);

        String link = baseUrl
                + "/learning?lrnId=" + sched.getLrn().getLrnId()
                + "&from=review&sched=" + sched.getRvwSchedId();

        Context ctx = new Context();
        ctx.setVariable("userName", resolveUserName(sched));
        ctx.setVariable("lrnTitle", lrnName);
        ctx.setVariable("stageLabel", ReviewResponseDto.stageLabelOf(sched.getStage()));
        ctx.setVariable("link", link);

        String html = templateEngine.process("mail/review-reminder", ctx);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper =
                new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject("[HiVibe] " + lrnName + " 복습할 시간이에요");
        helper.setText(html, true);

        mailSender.send(message);
        log.info("[RvwMail] 발송 완료 schedId={} to={}", sched.getRvwSchedId(), to);
    }

    private String resolveUserName(RvwSched sched) {
        String name = sched.getUser().getUserNm();
        return (name == null || name.isBlank()) ? "학습자" : name;
    }

    private String resolveLrnName(RvwSched sched) {
        String name = sched.getLrn().getLrnName();
        return (name == null || name.isBlank()) ? "학습" : name;
    }
}