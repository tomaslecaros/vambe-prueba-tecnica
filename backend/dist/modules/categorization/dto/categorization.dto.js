"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientProgressDto = exports.ProgressResponseDto = void 0;
class ProgressResponseDto {
    uploadId;
    total;
    waiting;
    active;
    completed;
    failed;
    progress;
    clients;
}
exports.ProgressResponseDto = ProgressResponseDto;
class ClientProgressDto {
    jobId;
    clientId;
    email;
    name;
    status;
    progress;
    categories;
}
exports.ClientProgressDto = ClientProgressDto;
//# sourceMappingURL=categorization.dto.js.map