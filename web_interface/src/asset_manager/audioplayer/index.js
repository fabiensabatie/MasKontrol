import MasKontrol from '../../masKontrol'
import React from 'react';
import Slider from 'react-input-slider';
import './audio.css';

class AudioPlayer extends MasKontrol {

	constructor(props) {
		super();
		this.player = React.createRef();
		this.state = {currentTime : 0, status: 'paused'};
	}

	handleSlider = (name, value) => {
		this.setState({[name]: value})
		this.player.current[name] = value;
		this.play();
	}

	pause = () => {
		this.player.current.pause();
		this.setState({status: 'paused'})
	}

	play = () => {
		this.player.current.play();
		this.setState({status: 'playing'})
	}

	render() {
		return (<div>
			<Slider axis="x" className='controller_slider' onChange={(coords) => this.handleSlider('currentTime', coords.x)}  x={this.state.currentTime} />
			{this.state.status === 'playing' ? <span onClick={this.pause}>PAUSE</span> : <span onClick={this.play}>PLAY</span> }
			<audio ref={this.player} src="/Synth Criminal.mp3"></audio>
		</div>);
	}
}

export default AudioPlayer;
