const express = require('express'),
	router = express.Router()
const app = express()

const admin = require('firebase-admin');
const serviceAcc2 = require('/var/www/service_acc_2.json')
const serviceAcc = require('/var/www/service_acc.json')

const path = require('path')
const fs = require('fs')
const https = require('https')
const credentials = {
  key: fs.readFileSync('privkey_dcwebsite.pem'), 
  cert: fs.readFileSync('fullchain_dcwebsite.pem')
}

const dbStudent = admin.initializeApp({
  credential: admin.credential.cert(serviceAcc),
  databaseURL: 'https://doubtconnect-a1cf3.firebaseio.com'
}, 'default').database()

const dbTeacher = admin.initializeApp({
  credential: admin.credential.cert(serviceAcc2),
  databaseURL: 'https://doubtconnect-teachers.firebaseio.com'
}, 'other').database()

const postOfflineTeachers = (req, res) => {
  dbTeacher
    .ref('Users')
    .orderByChild('status')
    .equalTo('online')
    .once('value', snapshot => {
      snapshot.forEach(data => {
        console.log(data.key)
	dbTeacher.ref(`Users/${data.key}/status`).set('offline')
      })
    })
}

const getPhaseTwoTeachers = (req, res) => {
  dbTeacher
    .ref('Users')
    .orderByChild('phase')
    .equalTo('two')
    .once('value', snapshot => {
      res.json(snapshot)
    })
}

const getHelpTeacherList = (req, res) => {
  dbTeacher
    .ref('Help')
    .once('value', snapshot => {
      res.json(snapshot)
    })
}

const getHelpStudentList = (req, res) => {
  dbStudent
    .ref('Help')
    .once('value', snapshot => {
      res.json(snapshot)
    })
}

const getStudentTickets = (req, res) => {
  dbStudent
    .ref('Ticket')
    .once('value', snapshot => {
      res.json(snapshot)
    })
}

const getTeacherTickets = (req, res) => {
  dbTeacher
    .ref('Ticket')
    .once('value', snapshot => {
      res.json(snapshot)
    })
}

const getRequestEditList = (req, res) => {
  dbTeacher
    .ref('Users')
    .orderByChild('request_edit')
    .equalTo('true')
    .once('value', snapshot => {
      res.json(snapshot)
    })
}

const getOnlineTeachers = (req, res) => {
  dbTeacher
    .ref('Users')
    .orderByChild('status')
    .equalTo('online')
    .once('value', snapshot => {
      res.json(snapshot)
    })
}

const getStudentData = (req, res) => {
  const { uid } = req.params
	dbStudent.ref(`Users/${uid}`)
		.once('value', snapshot => {
			res.json(snapshot)
		})
}

const checkStatusT = (req, res) => {
  dbTeacher
    .ref('Users')
    .orderByChild('status')
    .equalTo('busy')
    .once('value', snapshot => {
      res.json(snapshot)
    })
}

const checkStatusS = (req, res) => {
  dbStudent
    .ref('Users')
    .orderByChild('status')
    .equalTo('busy')
    .once('value', snapshot => {
      res.json(snapshot)
    })
}

const getTeacherData = (req, res) => {
  const { uid } = req.params
	dbTeacher.ref(`Users/${uid}`)
		.once('value', snapshot => {
			res.json(snapshot)
		})
}

const getUnsolvedDoubts = (req, res) => {
	dbStudent.ref('Sessions/Unsolved')
		.once('value', snapshot => {
			res.json(snapshot)
		})
}

const putPhase2 = (req, res) => {
	dbTeacher.ref(`Users/${req.query.uid}`).update({
		phase: 'three'
	})
	res.sendStatus(200)
}

const putRequestEdits = (req, res) => {
	dbTeacher.ref(`Users/${req.query.uid}`).update({
		request_access: 'true',
	})
	res.sendStatus(200)
}

const deleteStudentHelp = (req, res) => {
	dbStudent.ref(`Help/${req.query.uid}/${req.query.qid}`)
		.update({ closed: true })
	res.sendStatus(200)
}

const deleteTeacherHelp = (req, res) => {
	dbTeacher.ref(`Help/${req.query.uid}/${req.query.qid}`)
		.update({ closed: true })
	res.sendStatus(200)
}

const deleteStudentTicket = (req, res) => {
	dbStudent.ref(`Ticket/${req.query.uid}/${req.query.qid}`)
		.update({ closed: true })
	res.sendStatus(200)
}

const deleteTeacherTicket = (req, res) => {
	dbTeacher.ref(`Ticket/${req.query.uid}/${req.query.qid}`)
		.update({ closed: true })
	res.sendStatus(200)
}

const getStudentsSigned = (req, res) => {
	dbStudent.ref('Users').once('value', snapshot => {
		res.json(snapshot)
	})
}

const getTeachersSigned = (req, res) => {
	dbTeacher.ref('Users').once('value', snapshot => {
		res.json(snapshot)
	})
}

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'dc-dashboard/public')))

app.use((req, res, next) => {
	res.on('finish', () => {
		console.info(`[${new Date().toISOString()}] [INFO] [DASHBOARD] ${req.method} ${req.url}`, res.statusCode)
	})
	next()
})

app.use((req, res, next) => {
	// Route guard and security
	next()
})

app.get('/', (req, res) => {
  res.sendFile('dc-dashboard/public/index.html', { root: __dirname })
})

router.post('/offline', (req, res) => {
  setTeachersOffline()
})

router.get('/phase2', getPhaseTwoTeachers)
router.get('/help-t', getHelpTeacherList)
router.get('/help-s', getHelpStudentList)
router.get('/ticket-t', getTeacherTickets)
router.get('/ticket-s', getStudentTickets)
router.get('/request-edits', getRequestEditList)
router.get('/student/:uid', getStudentData)
router.get('/teacher/:uid', getTeacherData)
router.get('/unsolved-d', getUnsolvedDoubts)
router.get('/signed-students', getStudentsSigned)
router.get('/signed-teachers', getTeachersSigned)
router.get('/engadeged-teachers', checkStatusT)
router.get('/engadeged-student', checkStatusS)
router.put('/phase2', putPhase2)
router.put('/request-edits', putRequestEdits)
router.get('/online-t', getOnlineTeachers)
router.delete('/help-s', deleteStudentHelp)
router.delete('/help-t', deleteTeacherHelp)
router.delete('/ticket-t', deleteTeacherTicket)
router.delete('/ticket-s', deleteStudentTicket)

router.get('/', (req, res) => res.render('dashboard/api'))

app.use('/api', router)

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(7000, () => console.log('Listening on port 7000'));
