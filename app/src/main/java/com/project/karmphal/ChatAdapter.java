package com.project.karmphal;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.io.InputStream;
import java.net.URL;
import java.util.List;
import java.util.concurrent.Executors;

public class ChatAdapter extends RecyclerView.Adapter<ChatAdapter.ChatViewHolder> {

    public interface OnSpeakClickListener {
        void onSpeakClick(String text);
    }

    public interface OnImageShareClickListener {
        void onImageShareClick(String imageUrl, String title);
    }

    public interface OnImageDownloadClickListener {
        void onImageDownloadClick(String imageUrl, String title);
    }

    private final List<ChatMessage> messages;
    private OnSpeakClickListener speakClickListener;
    private OnImageShareClickListener imageShareClickListener;
    private OnImageDownloadClickListener imageDownloadClickListener;

    public ChatAdapter(List<ChatMessage> messages) {
        this.messages = messages;
    }

    public void setOnSpeakClickListener(OnSpeakClickListener listener) {
        this.speakClickListener = listener;
    }

    public void setOnImageShareClickListener(OnImageShareClickListener listener) {
        this.imageShareClickListener = listener;
    }

    public void setOnImageDownloadClickListener(OnImageDownloadClickListener listener) {
        this.imageDownloadClickListener = listener;
    }

    @NonNull
    @Override
    public ChatViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_chat_message, parent, false);
        return new ChatViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ChatViewHolder holder, int position) {
        ChatMessage message = messages.get(position);
        holder.tvMessage.setText(message.getText());

        LinearLayout.LayoutParams containerParams = (LinearLayout.LayoutParams) holder.layoutMessageContainer.getLayoutParams();
        
        if (message.isUser()) {
            holder.tvMessage.setBackgroundResource(R.drawable.bg_chat_user);
            containerParams.gravity = Gravity.END;
            holder.imgAvatar.setVisibility(View.GONE);
            holder.btnSpeakMessage.setVisibility(View.GONE);
            holder.layoutImageContainer.setVisibility(View.GONE);
        } else {
            holder.tvMessage.setBackgroundResource(R.drawable.bg_chat_ai);
            containerParams.gravity = Gravity.START;
            holder.imgAvatar.setVisibility(View.VISIBLE);
            holder.btnSpeakMessage.setVisibility(View.VISIBLE);
            holder.btnSpeakMessage.setOnClickListener(v -> {
                if (speakClickListener != null) {
                    speakClickListener.onSpeakClick(message.getText());
                }
            });

            if (message.hasImage()) {
                holder.layoutImageContainer.setVisibility(View.VISIBLE);
                loadImageAsync(message.getImageUrl(), holder.imgChatContent);

                holder.btnShareImage.setOnClickListener(v -> {
                    if (imageShareClickListener != null) {
                        imageShareClickListener.onImageShareClick(message.getImageUrl(), message.getText());
                    }
                });

                holder.btnDownloadImage.setOnClickListener(v -> {
                    if (imageDownloadClickListener != null) {
                        imageDownloadClickListener.onImageDownloadClick(message.getImageUrl(), message.getText());
                    }
                });
            } else {
                holder.layoutImageContainer.setVisibility(View.GONE);
            }
        }
        holder.layoutMessageContainer.setLayoutParams(containerParams);
    }

    private void loadImageAsync(String imageUrl, ImageView imageView) {
        Executors.newSingleThreadExecutor().execute(() -> {
            try {
                InputStream in = new URL(imageUrl).openStream();
                Bitmap bitmap = BitmapFactory.decodeStream(in);
                new Handler(Looper.getMainLooper()).post(() -> imageView.setImageBitmap(bitmap));
            } catch (Exception e) {
                new Handler(Looper.getMainLooper()).post(() -> imageView.setImageResource(R.drawable.bg_spiritual_header));
            }
        });
    }

    @Override
    public int getItemCount() {
        return messages.size();
    }

    static class ChatViewHolder extends RecyclerView.ViewHolder {
        LinearLayout layoutMessageContainer, layoutImageContainer;
        ImageView imgAvatar, imgChatContent;
        TextView tvMessage;
        ImageButton btnSpeakMessage, btnDownloadImage, btnShareImage;

        public ChatViewHolder(@NonNull View itemView) {
            super(itemView);
            layoutMessageContainer = itemView.findViewById(R.id.layoutMessageContainer);
            layoutImageContainer = itemView.findViewById(R.id.layoutImageContainer);
            imgAvatar = itemView.findViewById(R.id.imgAvatar);
            imgChatContent = itemView.findViewById(R.id.imgChatContent);
            tvMessage = itemView.findViewById(R.id.tvMessage);
            btnSpeakMessage = itemView.findViewById(R.id.btnSpeakMessage);
            btnDownloadImage = itemView.findViewById(R.id.btnDownloadImage);
            btnShareImage = itemView.findViewById(R.id.btnShareImage);
        }
    }
}
