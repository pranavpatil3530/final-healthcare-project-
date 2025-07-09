export interface Database {
  public: {
    Tables: {
      checkins: {
        Row: {
          id: string;
          user_id: string;
          mood_rating: number;
          stress_level: number;
          feelings_notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          mood_rating: number;
          stress_level: number;
          feelings_notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mood_rating?: number;
          stress_level?: number;
          feelings_notes?: string;
          created_at?: string;
        };
      };
    };
  };
}