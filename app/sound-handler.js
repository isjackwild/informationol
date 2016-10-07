const THREE = require('three');
import { GAIN } from './constants.js';

const INNER_ANGLE = 20;
const OUTER_ANGLE = 60;
const OUTER_GAIN = 0;
const ROLLOFF = 10;
const REF_DIST = 0.5;
const DIST_MODEL = 'exponential';
let isUnlocked = false;

window.AudioContext = window.AudioContext || window.webkitAudioContext;






export const AudioScene = () => {
	const context = new window.AudioContext();
	const gainNode = context.createGain();

	gainNode.gain.value = GAIN;
	gainNode.connect(context.destination);
	context.listener.setPosition(0, 0, 0);
	
	const unlockAudio = () => {
		window.removeEventListener('touchstart', unlockAudio);
		const buffer = context.createBuffer(1, 1, 22050);
		const source = context.createBufferSource();
		source.buffer = buffer;
		source.connect(context.destination);
		source.noteOn(0);

		setTimeout(() => {
			if((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE)) {
				isUnlocked = true;
			}
		}, 0);
	}
	window.addEventListener('touchstart', unlockAudio);

	const createPanner = (buffer) => {
		const pannerForward = context.createPanner();
		pannerForward.coneOuterGain = OUTER_GAIN;
		pannerForward.coneOuterAngle = OUTER_ANGLE;
		pannerForward.coneInnerAngle = INNER_ANGLE;
		pannerForward.rollofFactor = ROLLOFF;
		pannerForward.refDistance = REF_DIST;
		pannerForward.distanceModel = DIST_MODEL;
		pannerForward.connect(gainNode);

		const pannerBackward = context.createPanner();
		pannerBackward.coneOuterGain = OUTER_GAIN;
		pannerBackward.coneOuterAngle = OUTER_ANGLE;
		pannerBackward.coneInnerAngle = INNER_ANGLE;
		pannerBackward.rollofFactor = ROLLOFF;
		pannerBackward.refDistance = REF_DIST;
		pannerBackward.distanceModel = DIST_MODEL;
		pannerBackward.connect(gainNode);

		const source = context.createBufferSource();
		source.buffer = buffer;
		source.loop = true;
		source.connect(pannerForward);
		source.connect(pannerBackward);

		return { source, pannerForward, pannerBackward };
	}

	const decode = (response, onSuccess, onError) => {
		context.decodeAudioData(response, onSuccess, onError);
	}

	const positionListener = (position, orientation) => {
		context.listener.setPosition(position.x, position.y, position.z);
		const front = orientation;
		const up = new THREE.Vector3().copy(front).applyAxisAngle(
				new THREE.Vector3(1, 0, 1),
				Math.PI / 4
			);
		context.listener.setOrientation(front.x, front.y, front.z, up.x, up.y, up.z);
	}

	return { context, createPanner, decode, positionListener }
}