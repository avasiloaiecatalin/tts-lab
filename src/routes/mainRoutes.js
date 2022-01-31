const express = require('express')
const router = express.Router()
const textToSpeech = require("@google-cloud/text-to-speech")
const speech = require("@google-cloud/speech");
const vision = require("@google-cloud/vision");
const fs = require("fs")
const util = require("util")
const client = new textToSpeech.TextToSpeechClient({
    keyFilename: "src/key/credentials.json",
});

const speechClient = new speech.SpeechClient({
    keyFilename: "src/key/credentials.json",
});
let visionClient = new vision.ImageAnnotatorClient({
    keyFilename: "src/key/credentials.json",
});

router.get("/tts", async (req, res) => {
  const request = {
    input: { text: "Unde este autobuzul?" },
    voice: { languageCode: "ro-RO", ssmlGender: "FEMALE" },
    audioConfig: { audioEncoding: "MP3" },
  };
  const [response] = await client.synthesizeSpeech(request);

  // Writes the result to file
  const writeFile = util.promisify(fs.writeFile);
  await writeFile("out.mp3", response.audioContent, "binary");
  console.log("Audio content written to file: out.mp3");
})

router.get("/stt", async (req, res) => {
  const file = fs.readFileSync("src/audio/unde.wav");
  const audioBytes = file.toString("base64");

  const request = {
    audio: {
      content: audioBytes,
    },
    config: {
      encoding: "LINEAR16",
      sampleRateHertz: 44100,
      languageCode: "ro-RO",
    },
  };
  const [response] = await speechClient.recognize(request);

  // show the result
  const transcription = response.results[0].alternatives[0];
  console.log(transcription);
})

async function showLabels(imgPathAndName) {
    const [result] = await visionClient.labelDetection(imgPathAndName);
    const labels = result.labelAnnotations;
    console.log("Labels:");
    labels.forEach((label) => console.log(label.description));
  }
  
  async function showFacesEmotions(imgPathAndName) {
    const [result] = await visionClient.faceDetection(imgPathAndName);
    const faces = result.faceAnnotations;
    console.log("Faces:");
    faces.forEach((face, i) => {
      console.log(`  Face #${i + 1}:`);
      console.log(`    Joy: ${face.joyLikelihood}`);
      console.log(`    Anger: ${face.angerLikelihood}`);
      console.log(`    Sorrow: ${face.sorrowLikelihood}`);
      console.log(`    Surprise: ${face.surpriseLikelihood}`);
    });
  }
  
  async function showLandmarks(imgPathAndName) {
    const [result] = await visionClient.landmarkDetection(imgPathAndName);
    const landmarks = result.landmarkAnnotations;
    console.log("Landmarks:");
    landmarks.forEach((landmark) => console.log(landmark.description));
  }
  
  async function showLogos(imgPathAndName) {
    // Performs logo detection on the local file
    const [result] = await visionClient.logoDetection(imgPathAndName);
    const logos = result.logoAnnotations;
    console.log("Logos:");
    logos.forEach((logo) => console.log(logo));
  }
  
  async function showExplicite(imgPathAndName) {
    const [result] = await visionClient.safeSearchDetection(imgPathAndName);
    const detections = result.safeSearchAnnotation;
    console.log("Safe search:");
    console.log(`Adult: ${detections.adult}`);
    console.log(`Medical: ${detections.medical}`);
    console.log(`Spoof: ${detections.spoof}`);
    console.log(`Violence: ${detections.violence}`);
    console.log(`Racy: ${detections.racy}`);
  }
  
  async function showWebEntitiesAndPages(imgPathAndName) {
    const [result] = await visionClient.webDetection(imgPathAndName);
    const webDetection = result.webDetection;
    if (webDetection.fullMatchingImages.length) {
      console.log(
        `Full matches found: ${webDetection.fullMatchingImages.length}`
      );
      webDetection.fullMatchingImages.forEach((image) => {
        console.log(`  URL: ${image.url}`);
        console.log(`  Score: ${image.score}`);
      });
    }
  
    if (webDetection.partialMatchingImages.length) {
      console.log(
        `Partial matches found: ${webDetection.partialMatchingImages.length}`
      );
      webDetection.partialMatchingImages.forEach((image) => {
        console.log(`  URL: ${image.url}`);
        console.log(`  Score: ${image.score}`);
      });
    }
  
    if (webDetection.webEntities.length) {
      console.log(`Web entities found: ${webDetection.webEntities.length}`);
      webDetection.webEntities.forEach((webEntity) => {
        console.log(`  Description: ${webEntity.description}`);
        console.log(`  Score: ${webEntity.score}`);
      });
    }
  
    if (webDetection.bestGuessLabels.length) {
      console.log(
        `Best guess labels found: ${webDetection.bestGuessLabels.length}`
      );
      webDetection.bestGuessLabels.forEach((label) => {
        console.log(`  Label: ${label.label}`);
      });
    }
  }
  async function showText(imgPathAndName) {
    const [result] = await visionClient.textDetection(imgPathAndName);
    const detections = result.textAnnotations;
    console.log("Text:");
    console.log(detections[0].description);
    //detections.forEach(text => console.log(text));
  }
  
  async function showHandwriting(imgPathAndName) {
    const [result] = await visionClient.documentTextDetection(imgPathAndName);
    const fullTextAnnotation = result.fullTextAnnotation;
    return fullTextAnnotation.text
  }

  router.get("/vision", async (req, res) => {
    const x = await showHandwriting("src/images/11.jpg");
    console.log(x)
  })

  router.get("/all", async (req, res) => {
    const x = await showHandwriting("src/images/11.jpg");
    console.log(x)
  })

module.exports = router