export type Objective = 'Perder grasa' | 'Ganar músculo' | 'Resistencia';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  level: number;
  xp: number;
  objective: Objective;
  createdAt: string;
}

export interface Routine {
  id: string;
  name: string;
  daysPerWeek: number;
  durationMinutes: number;
  progress: number;
  image: string;
  isFavorite: boolean;
  category: string;
}

export interface Activity {
  id: string;
  uid: string;
  authorName: string;
  authorPhoto: string;
  type: string;
  content: string;
  metrics: {
    label: string;
    value: string;
  }[];
  kudos: number;
  comments: number;
  createdAt: any;
}

export interface Gym {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  tags: string[];
  distance: string;
  price: number;
  image: string;
  isPremium: boolean;
  location: {
    lat: number;
    lng: number;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: any;
}
