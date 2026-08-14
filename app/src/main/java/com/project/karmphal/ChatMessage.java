package com.project.karmphal;

public class ChatMessage {
    private String text;
    private boolean isUser;
    private String imageUrl;

    public ChatMessage(String text, boolean isUser) {
        this(text, isUser, null);
    }

    public ChatMessage(String text, boolean isUser, String imageUrl) {
        this.text = text;
        this.isUser = isUser;
        this.imageUrl = imageUrl;
    }

    public String getText() { return text; }
    public boolean isUser() { return isUser; }
    public String getImageUrl() { return imageUrl; }
    public boolean hasImage() { return imageUrl != null && !imageUrl.isEmpty(); }
}
