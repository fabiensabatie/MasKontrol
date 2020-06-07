import './manager.css';
import React from 'react';
import axios from 'axios';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import settingsFetcher from '../settings/settings_fetcher';
import MiniPlayer from './miniplayer';
// import AudioPlayer from './audioplayer';
import { Draggable, Droppable } from 'react-drag-and-drop'
import Button from 'react-bootstrap/Button';
import ReactModal from 'react-modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Slider from 'react-input-slider';

ReactModal.setAppElement('#root');

class AssetManager extends React.Component {

	constructor(props) {
		super();
		this.props = props;
		this.state = {
			sequences: [],
			hover_sequences: [],
			hover_sequencer: [],
			current: {},
			currentIndex: undefined,
			sequencer: [],
			search: '',
			modals: [],
			brightness: 100,
			speed: 25,
			meta: [],
			loop_until: "",
			loop_count: "1",
			loop_mode: false,
		}

	}

	sequenceName(sequence) { return sequence ? sequence.split('.')[0] : 'None' }

	getSettings = () => {
		return settingsFetcher()
			.then(_ => {
				if (_.data.success) { this.setState(_.data.result); return Promise.resolve() }
				else {
					console.log(_);
					NotificationManager.error('An error occured while fetching the settings, check the console');
					return Promise.reject();
				}
			}).catch(_ => { console.log(_); return Promise.reject(); })
	}

	listSequences = () => {
		let self = this;
		return axios.get(this.state.server_url + '/sequences')
			.then(_ => {
				if (_.data.success) {
					let state = self.state;
					_.data.result.map((_, i) => {
						state.hover_sequences[i] = false
						state.hover_sequencer[i] = false
						state.sequences.push(_);
						return true;
					});
					this.setState(state);
				}
				else console.log(_);
			}).catch(_ => console.log(_));
	}

	handleSlider = (name, value) => {
		this.setState({ [name]: value });
	}

	componentDidMount() {
		this.getSettings()
			.then(_ => {
				this.listSequences()
				this.getLists()
			})
			.catch()
	}

	preview = (i, sequencer = false) => {
		let sequences = sequencer ? this.state.sequencer : this.state.sequences.filter((sequence, i) => {
			if (this.state.search) {
				return sequence.toLowerCase().indexOf(this.state.search.toLowerCase()) >= 0 ? true : false;
			} else return true;
		});
		let hover = sequencer ? this.state.hover_sequencer : this.state.hover_sequences;
		if (hover[i]) {
			return <div className="thumbContainer">
				<img alt="thumbnail" className={(hover[i] ? "thumb hovered" : "thumb")} src={this.state.server_url + '/thumbnails/' + this.sequenceName(sequences[i]) + '.png'}></img>
				<MiniPlayer sequence={sequences[i]}></MiniPlayer>
			</div>
		} else {
			return <img
				alt="thumbnail" className={(hover[i] ? "thumb hovered" : "thumb")} src={this.state.server_url + '/thumbnails/' + this.sequenceName(sequences[i]) + '.png'}>
			</img>
		}
	}

	onDrop(data) {
		let sequences = this.state.sequencer;
		sequences.push(data.sequence);
		this.setState({ sequencers: sequences });
	}

	updateSequenceMeta = (i) => {
		let meta = this.state.meta;
		meta[i] = {
			brightness: this.state.brightness,
			speed: this.state.speed,
			loop_until: parseInt(this.state.loop_until),
			loop_count: parseInt(this.state.loop_count),
			loop_mode: this.state.loop_mode ? 'reversed' : 'normal'
		}
		this.setState({ meta });
	}

	onMouseEnter = (i, sequencer = false) => {
		let hover = sequencer ? this.state.hover_sequencer : this.state.hover_sequences;
		hover[i] = true;
		let key = sequencer ? "hover_sequencer" : "this.state.hover_sequences";
		this.setState({ [key]: hover });
	}

	onMouseLeave = (i, sequencer = false) => {
		let hover = sequencer ? this.state.hover_sequencer : this.state.hover_sequences;
		hover[i] = false;
		let key = sequencer ? "hover_sequencer" : "this.state.hover_sequences";
		this.setState({ [key]: hover });
	}

	showSequencer = () => {
		let self = this;
		if (this.props.sequencer) {
			return <div><Droppable type="sequence" className="sequencer" types={['sequence', 'sequencer']} onDrop={this.onDrop.bind(this)}>
				{this.state.sequencer.map((sequence, i) => {
					return this.showThumb(sequence, i, true);
				})}
			</Droppable>
				{/* <AudioPlayer></AudioPlayer> */}
				<div style={{ position: "relative", height: "60px", padding: "12px" }}>
					<Button style={{ margin: "5px" }} variant="success right" onClick={() => { this.playOnMask(this.state.sequencer, this.state.meta) }}>Play sequences</Button>
					<Button style={{ margin: "5px" }} variant="primary right" onClick={() => {
						this.playOnMask(this.state.sequences.filter((sequence, i) => {
							if (self.state.search) {
								return sequence.toLowerCase().indexOf(this.state.search.toLowerCase()) >= 0 ? true : false;
							} else return true;
						}).map(s => s.replace('.seq', '')))
					}}>Play all sequences</Button>
					<Button style={{ margin: "5px" }} variant="primary right" onClick={() => { this.saveOnMask(this.state.sequencer) }}>Save sequences</Button>
					<div style={{ maxWidth: "200px", margin: "5px", float: "right" }}>
						<Form.Control type="text" name="list_name" placeholder="My sequence" onChange={(event) => { self.setState({ [event.target.getAttribute('name')]: event.target.value }) }} value={self.state.list_name || ''} />
					</div>
				</div>


			</div>
		} else return;
	}

	playList = (name) => {
		NotificationManager.info('Playing on mask');
		return axios.post(this.state.pi_url + '/playList', { name: name.replace('.json', '') })
			.then(_ => {
				if (!_.data.success) {
					console.log(_);
					NotificationManager.error('An error occured, check the console');
				}
			}).catch(_ => {
				console.log(_);
				NotificationManager.error('An error occured, check the console');
			})
	}

	getLists = () => {
		return axios.get(this.state.pi_url + '/getLists')
			.then(_ => {
				if (!_.data.success) {
					console.log(_);
				} else {
					console.log('Adding lists')
					this.setState({ lists: _.data.lists })
				}
			}).catch(_ => {
				console.log(_);
			})
	}

	getList = (name) => {
		return axios.get(this.state.pi_url + '/getList?name=' + encodeURIComponent(name))
			.then(_ => {
				try {
					console.log(_.data)
					let data = _.data;
					this.setState({ sequencer: data.sequences, meta: data.meta, list_name: data.name })
				} catch (err) {
					console.error(err)
				}
			}).catch(_ => {
				console.log(_);
			})
	}

	saveOnMask = (names) => {
		let list_name = this.state.list_name || Math.random() * 10000000000000000;
		NotificationManager.info('Saving on mask');
		let meta = names.map((n, i) => this.state.meta[i] ? this.state.meta[i] : {});

		return axios.post(this.state.pi_url + '/saveList', { name: list_name, sequences: names, meta })
			.then(_ => {
				if (!_.data.success) {
					console.log(_);
					NotificationManager.error('An error occured, check the console');
				} else {
					NotificationManager.success('Saved on mask');
				}
			}).catch(_ => {
				console.log(_);
				NotificationManager.error('An error occured, check the console');
			})
	}

	downloadOnPi = (name) => {
		NotificationManager.info('Downloading on mask');
		return axios.post(this.state.server_url + '/sequences/download/' + name)
			.then(_ => {
				if (!_.data.success) {
					console.log(_);
					NotificationManager.error('An error occured, check the console');
				} else {
					NotificationManager.success('Downloaded');
				}
			}).catch(_ => {
				console.log(_);
				NotificationManager.error('An error occured, check the console');
			})
	}

	playOnMask = (names) => {
		NotificationManager.info('Playing on mask');
		let meta = names.map((n, i) => this.state.meta[i] ? this.state.meta[i] : {});
		return axios.post(this.state.server_url + '/sequences/play/', { sequences: names, meta })
			.then(_ => {
				if (!_.data.success) {
					console.log(_);
					NotificationManager.error('An error occured, check the console');
				}
			}).catch(_ => {
				console.log(_);
				NotificationManager.error('An error occured, check the console');
			})
	}

	showThumb = (sequence, i, sequencer = false) => {
		let self = this;
		return <Draggable type="sequence" className="asset mt20" key={i} data={self.sequenceName(sequence)} onMouseEnter={() => { self.onMouseEnter(i, false) }} onMouseLeave={() => { self.onMouseLeave(i, false) }}>
			{self.preview(i, sequencer)}
			<span>{self.sequenceName(sequence)}</span>
			<div>

				<img alt="Edit" className="icon" src="edit.png" onClick={() => {
					let modals = self.state.modals; modals[i] = true; self.setState({ modals })
				}}></img>

				<img alt="Play" className="icon" src="play.png" onClick={() => { self.playOnMask([self.sequenceName(sequence)]) }}></img>
				<img alt="Download" className="icon" src="download.png" onClick={() => { self.downloadOnPi(self.sequenceName(sequence)) }}></img>
				<img alt="Add" className="icon" src="add.png" onClick={() => {
					let sequences = self.state.sequencer;
					sequences.push(sequence);
					this.setState({ sequencers: sequences }) }}
				></img>

				<ReactModal className="config_modal" isOpen={self.state.modals[i]} contentLabel="Minimal Modal Example">
					<Row>
						<Col style={{ textAlign: 'center' }}>
							<Form.Label className="label">Brightness :</Form.Label>
							<Slider axis="x" onChange={(coords) => self.handleSlider('brightness', coords.x)} x={self.state.brightness} />
						</Col>
						<Col style={{ textAlign: 'center' }}>
							<Form.Label className="label">Playback speed :</Form.Label>
							<Slider axis="x" onChange={(coords) => self.handleSlider('speed', coords.x)} x={self.state.speed} />
						</Col>
					</Row>
					<Row>
						<Col style={{ textAlign: 'center' }}>
							<Form.Label className="label">Loop until :</Form.Label>
							<Form.Control type="number" name="loop_until" placeholder="2" onChange={(event) => { self.setState({ [event.target.getAttribute('name')]: event.target.value }) }} value={self.state.loop_until} />
						</Col>
					</Row>
					<Row>
						<Col style={{ textAlign: 'center' }}>
							<Form.Label className="label">Loop count (overides loop until):</Form.Label>
							<Form.Control type="number" name="loop_count" placeholder="2" onChange={(event) => { self.setState({ [event.target.getAttribute('name')]: event.target.value }) }} value={self.state.loop_count} />
						</Col>
					</Row>
					<Row style={{ marginTop: "10px" }}>
						<Col>
							<Form.Label className="label">Reversed loop :</Form.Label>
							<input type="checkbox" style={{ float: "right" }} name="loop_mode" onChange={(event) => { self.setState({ [event.target.getAttribute('name')]: event.target.checked }) }} value={self.state.loop_mode} />
						</Col>
					</Row>
					<Button variant="success right" style={{ margin: "5px" }} onClick={() => {
						let modals = self.state.modals;
						modals[i] = false;
						self.setState({ modals });
						self.updateSequenceMeta(i);
					}}>Apply</Button>
					<Button variant="danger right" style={{ margin: "5px" }} onClick={() => {
						let modals = self.state.modals;
						modals[i] = false;
						self.setState({ modals });
					}}>Cancel</Button>
				</ReactModal>
			</div>
		</Draggable>
	}


	render() {
		let self = this;
		return (<div>
			<NotificationContainer></NotificationContainer>
			{this.showSequencer()}
			<hr></hr>

			<div style={{ maxWidth: "200px", margin: "20px auto 20px auto", display: "block" }}>
				<Form.Label className="label">Search :</Form.Label>
				<Form.Control type="text" name="search" placeholder="Search a sequence" onChange={(event) => { self.setState({ [event.target.getAttribute('name')]: event.target.value }) }} value={self.state.search || ''} />
			</div>
			<div className="assetManager">
				{this.state.sequences.filter((sequence, i) => {
					if (self.state.search) {
						return sequence.toLowerCase().indexOf(this.state.search.toLowerCase()) >= 0 ? true : false;
					} else return true;
				}).map((sequence, i) => {
					return self.showThumb(sequence, i);
				})}
			</div>
			{this.state.lists && this.state.lists.map((list, i) =>
				<div style={{ display: "block", height: "50px" }} key={i}>
					<hr></hr>
					<span style={{ marginLeft: "0px" }}>{list.replace('.json', '')}</span>
					<img style={{ marginTop: "-30px", marginLeft: "calc(100% - 40px)" }} alt="Edit" className="icon" src="edit.png" onClick={() => { self.getList(list.replace('.json', '')) }}></img>
					<img style={{ marginTop: "-75px", marginLeft: "calc(100% - 70px)" }} alt="Play" className="icon" src="play.png" onClick={() => { self.playList(list) }}></img>
				</div>

			)}
		</div>);
	}
}

export default AssetManager;
