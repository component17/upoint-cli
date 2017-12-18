const request = require('request');
const post = (url, data = {}, token) => {
	let postData = Object.assign({}, {token}, data);
	return new Promise((resolve, reject) => {
		request.post(`http://localhost:8088/${url}`, {json: postData}, (err, response, body) => {
			
			if(err) {
				reject(err);
			}
			
			if(body.error) {
				reject(body);
			}
			if(response.statusCode !== 200) {
				reject(body);
			}
			
			resolve(body);
		});
	});
}

module.exports = {post};