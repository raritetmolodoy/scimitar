import firebase from 'firebase/app'
import { db, auth } from '../../main.js'

const state = {
  uid: null,
  email: null,
  emailVerified: null,
  name: null,
  surname: null,
  isTeacher: null
}

const getters = {}

const mutations = {
  setAuthData(state, user) {
    state.uid = user ? user.uid : null
    state.email = user ? user.email : null
    state.emailVerified = user ? user.emailVerified : null
  },
  setUserData(state, user) {
    state.name = user ? user.name : null
    state.surname = user ? user.surname : null
    state.isTeacher = user ? user.isTeacher : null
  }
}

const actions = {
  async signUp({ commit }, opt) {
    commit('setLoading', 'btn__signUp')
    try {
      let creds = await auth.createUserWithEmailAndPassword(opt.email, opt.password)
      db.collection('users').doc(creds.user.uid).set({
        name: opt.name,
        surname: opt.surname,
        isTeacher: opt.isTeacher
      })
    } catch (err) {
      commit('setToastMsg', { error: true, msg: err.message })
    }
    commit('unsetLoading')
  },

  async signIn({ commit }, opt) {
    commit('setLoading', 'btn__signIn')
    try {
      await auth.signInWithEmailAndPassword(opt.email, opt.password)
      return true
    } catch (err) {
      commit('setToastMsg', { error: true, msg: err.message })
      commit('unsetLoading')
    }
  },

  async googleSignIn({ commit }) {
    commit('setLoading', 'btn-googleSign')
    try {
      let googleProvider = new firebase.auth.GoogleAuthProvider()
      await auth.signInWithPopup(googleProvider)
    } catch (err) {
      commit('setToastMsg', { error: true, msg: err.message })
      commit('unsetLoading')
    }
  },

  signOut() {
    location.reload()
    auth.signOut()
  },

  async recoverPassword({ commit }, opt) {
    commit('setLoading', 'btn__restorePassword')
    try {
      await auth.sendPasswordResetEmail(opt.email, {
        url: 'https://project-scimitar.web.app/login',
      })
      commit('setToastMsg', { msg: 'Ссылка востановления отправлена' })
      commit('unsetLoading')
      return true
    } catch (err) {
      commit('setToastMsg', { error: true, msg: err.message })
      commit('unsetLoading')
    }
  },

  async verifyEmail({ commit }) {
    try {
      await auth.currentUser.sendEmailVerification()
      commit('setToastMsg', { msg: 'Ссылка подтверждения отправлена' })
    } catch (err) {
      commit('setToastMsg', { error: true, msg: err.message })
    }
  },

  async updateData({ commit, state }, data) {
    commit('setLoading', 'btn__updateData')
    try {
      let userDoc = db.collection('users').doc(state.uid)
      await userDoc.update({
        name: data.name,
        surname: data.surname
      })
      let fetchedData = await userDoc.get()
      commit('setUserData', fetchedData.data())
      commit('setToastMsg', { msg: 'Имя успешно изменено' })
    } catch (err) {
      commit('setToastMsg', { error: true, msg: err.message })
    }
    commit('unsetLoading')
  },

  async updateEmail({ commit, state }, data) {
    commit('setLoading', 'btn__updateAuthData')
    try {
      let user = await auth.signInWithEmailAndPassword(state.email, data.password)
      await auth.currentUser.updateEmail(data.newEmail)
      await auth.currentUser.sendEmailVerification()
      commit('setAuthData', user.user)
      commit('setToastMsg', { msg: 'Запрос на смену эл. почты отправлен' })
      return true
    } catch (err) {
      commit('setToastMsg', { error: true, msg: err.message })
    } finally {
      commit('unsetLoading')
    }
  },

  async updatePassword({ commit, state }, passwords) {
    commit('setLoading', 'btn__updateAuthData')
    try {
      let user = await auth.signInWithEmailAndPassword(state.email, passwords.old)
      await auth.currentUser.updatePassword(passwords.new)
      commit('setAuthData', user.user)
      commit('setToastMsg', { msg: 'Пароль успешно изменен' })
      return true
    } catch (err) {
      commit('setToastMsg', { error: true, msg: err.message })
    } finally {
      commit('unsetLoading')
    }
  }
}


export default { state, getters, mutations, actions }