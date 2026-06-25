package com.hivibe.server.lrn.dto;

import java.util.List;

public record SubmissionRequestDto(
    List<AnswerItem> answers
) {}