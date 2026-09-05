import { ExpressionType } from './vision';

export type SerialEventType =
  | 'PERSON_ENTERED'
  | 'PERSON_LEFT'
  | 'ALL_PEOPLE_LEFT'
  | 'EXPRESSION_CHANGED'
  | 'SUDDEN_EXPRESSION_CHANGE'
  | 'NEW_PERSON_CAUSED_EXPRESSION_CHANGE'
  | 'MUTUAL_INTERACTION'
  | 'SIMULTANEOUS_REACTION';

export interface SerialBaseEvent {
  id: string;
  type: SerialEventType;
  timestamp: number;
  formattedTime: string;
  description: string;
}

export interface PersonEnterEvent extends SerialBaseEvent {
  type: 'PERSON_ENTERED';
  faceId: string;
  totalFaces: number;
}

export interface PersonLeftEvent extends SerialBaseEvent {
  type: 'PERSON_LEFT' | 'ALL_PEOPLE_LEFT';
  faceId: string;
  totalFaces: number;
}

export interface ExpressionChangeEvent extends SerialBaseEvent {
  type: 'EXPRESSION_CHANGED' | 'SUDDEN_EXPRESSION_CHANGE';
  faceId: string;
  previousExpression: ExpressionType;
  newExpression: ExpressionType;
  confidence: number;
  intensity: number;
  changeMagnitude: number;
}

export interface NewPersonCausedChangeEvent extends SerialBaseEvent {
  type: 'NEW_PERSON_CAUSED_EXPRESSION_CHANGE';
  personAffected: string;
  newPerson: string;
  previousExpression: ExpressionType;
  newExpression: ExpressionType;
  timeDeltaMs: number;
}

export interface MutualInteractionEvent extends SerialBaseEvent {
  type: 'MUTUAL_INTERACTION';
  facesInvolved: string[];
  interactionType: 'FACING_EACH_OTHER' | 'INTENSE_STARE';
}

export interface SimultaneousReactionEvent extends SerialBaseEvent {
  type: 'SIMULTANEOUS_REACTION';
  facesInvolved: string[];
  expressions: Record<string, ExpressionType>;
}

export type SerialEvent =
  | PersonEnterEvent
  | PersonLeftEvent
  | ExpressionChangeEvent
  | NewPersonCausedChangeEvent
  | MutualInteractionEvent
  | SimultaneousReactionEvent;
