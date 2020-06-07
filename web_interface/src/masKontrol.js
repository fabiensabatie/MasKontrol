import React from 'react';
import settingsFetcher from './settings/settings_fetcher';

class MasKontrol extends React.Component {
	getSettings = () => {
		return settingsFetcher()
			.catch(_ => { console.log(_); })
	}

	componentDidMount() {
		this.getSettings()
	}
}

export default MasKontrol;
