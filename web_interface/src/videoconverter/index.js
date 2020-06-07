import '../settings/form.css'
import React from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Menu from '../menu'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import axios from 'axios'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import 'react-notifications/lib/notifications.css'
import settingsFetcher from '../settings/settings_fetcher'
import Slider from 'react-input-slider'
import GphApiClient from 'giphy-js-sdk-core'
import './gifs.css'

class VideoConverter extends React.Component {
    constructor() {
        super()
        this.state = {
            files: React.createRef(),
            drag: false,
            uploading: false,
            giphy: GphApiClient('wSBm6IulAFtjXE2zwnrZyvUdWHiRbIXa'),
            gifs: [],
            youtube: '',
        }
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value })
    }

    getSettings = () => {
        return settingsFetcher()
            .then((_) => {
                if (_.data.success) {
                    this.setState(_.data.result)
                } else {
                    console.log(_)
                    NotificationManager.error('An error occured while fetching the settings, check the console')
                }
            })
            .catch((_) => {
                console.log(_)
            })
    }

    handleSubmit = (event) => {
        event.preventDefault()
        let data = new FormData()

        data.append('file', this.state.files)
        data.append('width', parseInt(this.state.width))
        data.append('height', parseInt(this.state.height))
        data.append('brightness', parseInt(this.state.guiBrightness))
        data.append('contrast', parseInt(this.state.guiContrast))
        data.append('saturation', parseInt(this.state.guiSaturation))
        data.append('convert', true)

        for (let file of this.state.files.current.files) data.append('file', file)

        this.setState({ uploading: true })

        axios
            .post(this.state.server_url + '/videoConverter', data)
            .then((_) => {
                if (_.data.success) NotificationManager.success('Video(s) uploaded.')
                else {
                    console.log(_)
                    NotificationManager.error('An error occured, check the console')
                }
            })
            .catch((_) => {
                console.log(_)
                NotificationManager.error('An error occured, check the console')
            })
            .finally((_) => {
                this.setState({ uploading: false })
            })
    }

    handleSlider = (name, value) => {
        this.setState({ [name]: value })
    }

    componentDidMount() {
        this.getSettings()
    }

    downloadYoutube = (e) => {
        e.preventDefault()
        NotificationManager.info('Creating sequence from a Youtube video')
        return axios
            .post(this.state.server_url + '/onlineConverter', {
                url: this.state.youtube,
                name: 'youtube',
                brightness: this.state.guiBrightness,
                contrast: this.state.guiContrast,
                saturation: this.state.guiSaturation,
            })
            .then((_) => {
                if (_.data.success) NotificationManager.success('Youtube video converted.')
                else {
                    console.log(_)
                    NotificationManager.error('An error occured, check the console')
                }
            })
            .catch((_) => {
                console.log(_)
                NotificationManager.error('An error occured, check the console')
            })
    }

    addGif = (e) => {
        NotificationManager.info('Creating sequence.')
        e.preventDefault()
        console.log(e.target)
        let name = e.target.getAttribute('name')
        return axios
            .post(this.state.server_url + '/onlineConverter', {
                url: name.split('_____')[1],
                name: name.split('_____')[0],
                brightness: this.state.guiBrightness,
                contrast: this.state.guiContrast,
                saturation: this.state.guiSaturation,
            })
            .then((_) => {
                if (_.data.success) NotificationManager.success('GIF created.')
                else {
                    console.log(_)
                    NotificationManager.error('An error occured, check the console')
                }
            })
            .catch((_) => {
                console.log(_)
                NotificationManager.error('An error occured, check the console')
            })
            .finally((_) => {
                this.setState({ uploading: false })
            })
    }

    searchGiphy = (event) => {
        event.preventDefault()
        let search = this.state.search
        console.log(search)
        this.setState({ searching: true })
        return this.state.giphy
            .search('gifs', { q: search })
            .then((response) => {
                console.log(response.data)
                this.setState({ searching: false, gifs: response.data })
            })
            .catch((err) => {
                console.log(err)
            })
    }

    showUploadButton = () => {
        return this.state.uploading ? (
            <Button variant="success right" type="submit">
                <img src="rolling.svg" alt="Converting" className="rolling"></img>
            </Button>
        ) : (
            <Button variant="success right" type="submit">
                Upload
            </Button>
        )
    }

    showSearchGIFButton = () => {
        return this.state.searching ? (
            <Button variant="success right" type="submit">
                <img src="rolling.svg" alt="Converting" className="rolling"></img>
            </Button>
        ) : (
            <Button variant="success right" type="submit">
                Search
            </Button>
        )
    }

    showGifs = (gifs) => {
        return (
            <div className="gifManager">
                {gifs.map((gif, i) => {
                    if (gif.title) {
                        let name = gif.title.trim()
                        if (!name) name = this.state.search + '_' + Math.random() * 100000000
                        return (
                            <div
                                key={i}
                                className="gif"
                                onClick={this.addGif}
                                name={`${name}_____${gif.images.original.url}`}
                                style={{ backgroundImage: `url(${gif.images.downsized.url})` }}
                            ></div>
                        )
                    } else return null
                })}
            </div>
        )
    }

    render() {
        return (
            <div>
                <NotificationContainer />
                <Menu></Menu>
                <div className="mainBody">
                    <Form className="form" method="POST" onSubmit={this.handleSubmit}>
                        <Form.Label className="label">Conversion settings :</Form.Label>
                        <Row className="mt30">
                            <Col>
                                <Form.Label className="label">Contrast :</Form.Label>
                                <Slider
                                    axis="x"
                                    onChange={(coords) => this.handleSlider('guiContrast', coords.x)}
                                    x={this.state.guiContrast}
                                />
                            </Col>
                            <Col>
                                <Form.Label className="label">Brightness :</Form.Label>
                                <Slider
                                    axis="x"
                                    onChange={(coords) => this.handleSlider('guiBrightness', coords.x)}
                                    x={this.state.guiBrightness}
                                />
                            </Col>
                            <Col>
                                <Form.Label className="label">Saturation :</Form.Label>
                                <Slider
                                    axis="x"
                                    onChange={(coords) => this.handleSlider('guiSaturation', coords.x)}
                                    x={this.state.guiSaturation}
                                />
                            </Col>
                        </Row>
                        <Form.Label className="label">Upload a file :</Form.Label>
                        <Row className="mt30">
                            <Col>
                                <input name="files" type="file" multiple ref={this.state.files} />
                            </Col>
                            {this.showUploadButton()}
                        </Row>
                    </Form>
                    <Form className="form" onSubmit={this.downloadYoutube}>
                        <div style={{ margin: '20px auto 20px auto', display: 'block' }}>
                            <Form.Label className="label">Download a Youtube video :</Form.Label>
                            <Form.Control
                                type="text"
                                name="youtube"
                                placeholder="https://www.youtube.com/watch?v=YE7VzlLtp-4"
                                value={this.state.youtube}
                                onChange={this.handleChange}
                            />
                        </div>
                    </Form>
                    <Form className="form" onSubmit={this.searchGiphy}>
                        <div style={{ margin: '20px auto 20px auto', display: 'block' }}>
                            <Form.Label className="label">Search GIF :</Form.Label>
                            <Form.Control
                                type="text"
                                name="search"
                                placeholder="Search a sequence"
                                value={this.state.search}
                                onChange={this.handleChange}
                            />
                        </div>
                    </Form>
                    {this.showGifs(this.state.gifs)}
                </div>
            </div>
        )
    }
}

export default VideoConverter
