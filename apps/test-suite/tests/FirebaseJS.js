// import { DEFAULT_WEB_APP_OPTIONS } from 'expo-firebase-core';
import * as FileSystem from 'expo-file-system';
import firebase from 'firebase';

import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/database';
import 'firebase/storage';
import 'firebase/functions';

// The modules below require browser features and
// are not compatible within the react-native context.
// import "firebase/analytics";
// import "firebase/remote-config";
// import "firebase/messaging";
// import "firebase/performance";
// import "firebase/installations";

export const name = 'FirebaseJS';

const FIREBASE_CONFIG = {
  // NOT COMMITED
};

export async function test({ describe, it, expect, beforeAll }) {
  beforeAll(() => {
    try {
      firebase.initializeApp(FIREBASE_CONFIG);
    } catch (err) {
      // nop
    }
  });

  describe('FirebaseJS', async () => {
    describe('auth', async () => {
      it(`calls auth() succesfully`, () => {
        firebase.auth();
      });
    });

    describe('database', async () => {
      it(`calls database() succesfully`, () => {
        const db = firebase.database();
        expect(db).not.toBeNull();
      });
    });

    describe('firestore', async () => {
      it(`calls firestore() succesfully`, () => {
        const db = firebase.firestore();
        expect(db).not.toBeNull();
      });
      it(`gets a collection`, async () => {
        let error = null;
        try {
          const { docs } = await firebase
            .firestore()
            .collection('tests')
            .get();
          expect(docs.length).toBeGreaterThan(0);
        } catch (e) {
          error = e;
        }
        expect(error).toBeNull();
      });
      it(`gets a document`, async () => {
        let error = null;
        try {
          const snapshot = await firebase
            .firestore()
            .doc('tests/doc1')
            .get();
          expect(snapshot).not.toBeNull();
        } catch (e) {
          error = e;
        }
        expect(error).toBeNull();
      });
    });

    describe('functions', async () => {
      it(`calls functions() succesfully`, () => {
        const functions = firebase.functions();
        expect(functions).not.toBeNull();
      });
      it(`calls the echo function`, async () => {
        let error = null;
        try {
          const message = "I'm a unit test";
          const echoMessage = firebase.functions().httpsCallable('echoMessage');
          const response = await echoMessage({ message });
          const responseMessage = response.data.message;
          expect(responseMessage).toBe(`Hi 👋, you said: ${message}`);
        } catch (e) {
          error = e;
        }
        expect(error).toBeNull();
      });
    });

    describe('storage', () => {
      it(`calls storage() succesfully`, () => {
        const storage = firebase.storage();
        expect(storage).not.toBeNull();
      });
      it(`lists all files`, async () => {
        let error = null;
        try {
          const files = await firebase
            .storage()
            .ref('public')
            .listAll();
        } catch (e) {
          error = e;
        }
        expect(error).toBeNull();
      });

      describe('getDownloadURL()', async () => {
        it(`returns valid url`, async () => {
          let error = null;
          try {
            const files = await firebase
              .storage()
              .ref('public')
              .listAll();
            expect(files.items.length).toBe(1);
            const file = files.items[0];
            const downloadUrl = await file.getDownloadURL();
            expect(typeof downloadUrl).toBe('string');
            const startUrl = 'https://firebasestorage.googleapis.com';
            expect(downloadUrl.substring(0, startUrl.length)).toBe(startUrl);
          } catch (e) {
            error = e;
          }
          expect(error).toBeNull();
        });
        it(`downloads the file`, async () => {
          let error = null;
          try {
            const files = await firebase
              .storage()
              .ref('public')
              .listAll();
            expect(files.items.length).toBe(1);
            const file = files.items[0];
            const downloadUrl = await file.getDownloadURL();
            const { uri } = await FileSystem.downloadAsync(
              downloadUrl,
              FileSystem.documentDirectory + file.name
            );
            expect(typeof uri).toBe('string');
            expect(uri).not.toBeNull();
          } catch (e) {
            error = e;
          }
          expect(error).toBeNull();
        });
      });

      describe('putFile()', async () => {
        it(`upload file succesfully`, async () => {
          let error = null;
          try {
            const currentUser = firebase.auth ? firebase.auth().currentUser : undefined;
            if (!currentUser) return;
            // const suffix = new Date().toISOString().replace(/\D/g, '');
            const fileContent = new ArrayBuffer(1000);
            const ref = firebase
              .storage()
              .ref(`users/${currentUser.uid}`)
              .child(`unittest`);
            // @ts-ignore
            const uploadTask = ref.put(fileContent);
            await new Promise((resolve, reject) => {
              uploadTask.on(
                firebase.storage.TaskEvent.STATE_CHANGED,
                snapshot => {},
                reject,
                resolve
              );
            });
          } catch (e) {
            error = e;
          }
          expect(error).toBeNull();
        });
      });
    });
  });
}
