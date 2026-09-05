import { ExpressionState } from '../config/constants';

export type EventType =
  | 'PERSON_ENTERED'
  | 'PERSON_LEFT'
  | 'ALL_PEOPLE_LEFT'
  | 'EXPRESSION_CHANGED'
  | 'SUDDEN_EXPRESSION_CHANGE'
  | 'MUTUAL_INTERACTION'
  | 'SIMULTANEOUS_REACTION'
  | 'NEW_PERSON_CAUSED_EXPRESSION_CHANGE';

export interface VisionEvent {
  id: string;
  type: EventType;
  timestamp: number;
  timeFormatted: string;
  personAffected?: string; // e.g. "Face 1"
  newPerson?: string; // e.g. "Face 2"
  previousExpression?: ExpressionState;
  newExpression?: ExpressionState;
  intensity?: number;
  description: string;
}

export interface CombinedEventPayload {
  events: VisionEvent[];
  activeFacesCount: number;
  activeFacesSummary: {
    faceId: string;
    expression: ExpressionState;
    confidence: number;
    durationSeconds: number;
  }[];
  timestamp: string;
}

