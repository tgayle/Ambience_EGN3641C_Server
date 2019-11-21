import { Collection, IEntity } from 'fireorm';
export type RoomStatus = 'in-progress' | 'failed' | 'completed';
export type StringDate = string;

@Collection('rooms')
export default class AmbienceRoom implements LocalRoom, IEntity {
  accountSid: string;
  dateCreated: Date;
  dateUpdated: Date;
  duration: number;
  enableTurn: boolean;
  endTime: Date;
  links: string;
  maxParticipants: number;
  mediaRegion: string;
  recordParticipantsOnConnect: boolean;
  sid: string;
  status: "in-progress" | "completed" | "failed";
  statusCallback: string;
  statusCallbackMethod: string;
  type: "peer-to-peer" | "group" | "group-small";
  uniqueName: string;
  url: string;
  videoCodecs: ("VP8" | "H264")[];
  password: string | null;
  private: boolean;
  creator: string;
  id: string;

  static fromParams(params: LocalRoom) {
    const room = new AmbienceRoom();
    Object.assign(room, {
      accountSid: params.accountSid,
      creator: params.creator,
      dateCreated: params.dateCreated,
      dateUpdated: params.dateCreated,
      duration: params.duration,
      enableTurn: params.enableTurn,
      endTime: params.endTime,
      links: params.links,
      maxParticipants: params.maxParticipants,
      password: params.password,
      private: params.private,
      recordParticipantsOnConnect: params.recordParticipantsOnConnect,
      sid: params.sid,
      status: params.status,
      statusCallback: params.statusCallback,
      statusCallbackMethod: params.statusCallbackMethod,
      type: params.type,
      uniqueName: params.uniqueName,
      url: params.url,
      videoCodecs: params.videoCodecs
    })
    return room;
  }
}

export type LocalRoom = Room & {
  password: string | null;
  private: boolean;
  creator: string;
}

export type Room = {
  accountSid: string;  
  dateCreated: Date;
  dateUpdated: Date;
  duration: number;
  enableTurn: boolean;
  endTime: Date;
  links: string;
  maxParticipants: number;
  recordParticipantsOnConnect: boolean;
  sid: string;
  status: "in-progress" | "completed" | "failed";
  statusCallback: string;
  statusCallbackMethod: string;
  type: "peer-to-peer" | "group" | "group-small";
  uniqueName: string;
  url: string;
  videoCodecs: ("VP8" | "H264")[];
}