package com.project.karmphal;

public class LeaderboardUser {
    public String id;
    public String full_name;
    public long sadhana_points;

    public LeaderboardUser() { }
    
    public LeaderboardUser(String id, String full_name, long sadhana_points) {
        this.id = id;
        this.full_name = full_name;
        this.sadhana_points = sadhana_points;
    }
}
