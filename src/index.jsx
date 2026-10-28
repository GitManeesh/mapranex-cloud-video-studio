import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {MapranexPilot} from './pilot.jsx';
const Root=()=> <Composition id="MapranexPilot" component={MapranexPilot} durationInFrames={900} fps={30} width={1080} height={1920}/>;
registerRoot(Root);
