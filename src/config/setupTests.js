var enzyme = require('enzyme')
var Adapter = require('enzyme-adapter-react-16')
;(function() {
    enzyme.configure({ adapter: new Adapter() })
})()
