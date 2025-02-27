package com.ticket.management.ticket_management_backend.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;

@Getter
@Data
public class NotificationMessage {
    private String message;
    @JsonCreator
    public NotificationMessage(@JsonProperty("message") String message) {
        this.message = message;
    }

    @Override
    public String toString() {
        return "NotificationMessage{message='" + message + "'}";
    }
}
