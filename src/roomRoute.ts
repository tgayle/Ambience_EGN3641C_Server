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
  type ExpectedNewRoomBody = {
    creator: string | undefined;
    name: string;
    private: string | undefined;
    password: string | undefined;
  };

  const { name: roomName, private: isPrivate, password, creator } = req.body as ExpectedNewRoomBody
  console.log(req.body);

  const room = await t.video.rooms.create({
    statusCallback: 'https://dc77a684.ngrok.io/room/update',
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

router.post('/update', async (req, res) => {
  res.send("yes");
  console.log('\n\n\n\n')
  console.log(req.body);
  // TODO: Persist these updates to firestore.
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
  type JoinParamsExpected = {
    name: string,
    password: string | undefined,
  }

  const {name, password} = req.query as JoinParamsExpected;

  const repo = getRepository(AmbienceRoom);
  const roomFromFirebase = await repo.whereEqualTo('uniqueName', name).findOne();

  if (!roomFromFirebase) {
    return res.status(404).json({error: 'That room doesn\'t exist.'})
  }

  if (roomFromFirebase.password && roomFromFirebase.password !== password) {
    return res.status(401).json({error: 'Either that room doesn\'t exist or you entered an invalid password.'})
  }

  return res.json({
    room: {
      name: roomFromFirebase.uniqueName,
      url: roomFromFirebase.url,
      maxParticipants: roomFromFirebase.maxParticipants
    }
  })
})


export default router;