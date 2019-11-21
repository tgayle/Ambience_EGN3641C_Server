import { Router } from "express";
import { getRepository } from "fireorm";
import twilio from 'twilio';
import AmbienceRoom from "./models/Room";
import axios from 'axios';

const t = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)

axios.defaults.baseURL = 'https://video.twilio.com/v1/'
axios.defaults.auth = {
  username: process.env.API_KEY,
  password: process.env.API_KEY_SECRET
}

// const tempDB: AmbienceRoom[] = [];

const router = Router();
router.get('/', async (req, res) => {
  const roomRepo = getRepository(AmbienceRoom);
  const rooms = await roomRepo.whereEqualTo('private', false).find();
  res.json(rooms);
});

router.post('/', async (req, res) => {
  const { name: roomName, private: isPrivate, password, creator } = req.body as any as { 
    creator: string | undefined, 
    name: string, 
    private: string | undefined, 
    password: string | undefined
  }
  console.log(req.body);

  const room = await t.video.rooms.create({
    uniqueName: roomName,
    recordParticipantsOnConnect: false
  });

  const repo = getRepository(AmbienceRoom);

  const thisRoom = AmbienceRoom.fromParams({
    ...room,
    private: !!isPrivate,
    password: password || null,
    creator: creator || 'unknown',
  });
  // console.log(thisRoom);
  const createdRoom = await repo.create(thisRoom);

  res.json(createdRoom);
})

router.get('/update', async (req, res) => {
  const rooms = await t.video.rooms.list();

  console.log(`There are ${rooms.length} rooms.`);
  // Insert into firestore if it doesn't already exist there.

  const repo = getRepository(AmbienceRoom);
  const fireRooms = await repo.find();
  repo.runTransaction(async (trans) => {
    const rooms = await trans.find();
    await Promise.all(rooms.map(room => trans.delete(room.id)));
  });

  const roomsNotInTwilio = fireRooms.filter(room => rooms.some(aRoom => aRoom.sid === room.sid));
  console.log(roomsNotInTwilio.map(r => r.sid));

  res.json({ done: true });
})

router.get('/join', async (req, res) => {
  res.send('join');
})


export default router;