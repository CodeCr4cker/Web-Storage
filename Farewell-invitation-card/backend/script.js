// Consolidated and cleaned JavaScript for Farewell page
// Place this script where the original <script> was. It unifies error utilities,
// Firebase auth/comments, gallery/trip logic, video book, audio handling, and UI interactions.

(() => {
  // ========== ERROR / SUCCESS UTILITIES ==========
  (function (global) {
    function getEl(el) {
      if (!el) return null;
      if (typeof el === 'string') {
        return document.getElementById(el) || document.querySelector(el);
      }
      return el;
    }

    function applyVisibility(el, show) {
      if (!el) return;
      if (show) {
        el.classList.add('show');
        if (el.style.display === 'none') el.style.display = '';
      } else {
        el.classList.remove('show');
      }
    }

    function setError(target, message) {
      const el = getEl(target);
      if (!el) return;
      el.textContent = message || '';
      applyVisibility(el, true);
      el.setAttribute('role', 'alert');
      el.setAttribute('aria-live', 'assertive');
    }

    function setSuccess(target, message) {
      const el = getEl(target);
      if (!el) return;
      el.textContent = message || '';
      applyVisibility(el, true);
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
    }

    function clearError(target) {
      const el = getEl(target);
      if (!el) return;
      el.textContent = '';
      applyVisibility(el, false);
      el.removeAttribute('role');
      el.removeAttribute('aria-live');
      if (el.style.display === 'block' || el.style.display === 'inline-block') {
        el.style.display = '';
      }
    }

    function showTempError(target, message, timeout = 3000) {
      setError(target, message);
      const el = getEl(target);
      if (!el) return;
      clearTimeout(el.__hideTimeout);
      el.__hideTimeout = setTimeout(() => clearError(el), timeout);
    }

    function showTempSuccess(target, message, timeout = 3000) {
      setSuccess(target, message);
      const el = getEl(target);
      if (!el) return;
      clearTimeout(el.__hideTimeout);
      el.__hideTimeout = setTimeout(() => clearError(el), timeout);
    }

    const ErrorUtils = {
      setError,
      setSuccess,
      clearError,
      showTempError,
      showTempSuccess
    };

    // Backwards compatible names
    window.showError = setError;
    window.showSuccess = setSuccess;
    window.hideError = clearError;
    window.ErrorUtils = ErrorUtils;
  })(window);

  // ========== FIREBASE INITIALIZATION ==========
  // (Retain compat SDK usage as in original)
  const firebaseConfig = {
    apiKey: "AIzaSyDr_reHnwMBlZ8HnhT-Ae9Rl4wwvOG2nuk",
    authDomain: "chat-67712.firebaseapp.com",
    databaseURL: "https://chat-67712-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "chat-67712",
    storageBucket: "chat-67712.firebasestorage.app",
    messagingSenderId: "666294677963",
    appId: "1:666294677963:web:42b547e2dd362e7847464e",
    measurementId: "G-SV83LJ44YJ"
  };
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const database = firebase.database();

  // ========== DOM ELEMENTS ==========
  const el = id => document.getElementById(id);
  const commentBtn = el('commentBtn');
  const loginModal = el('loginModal');
  const registerModal = el('registerModal');
  const commentModal = el('commentModal');
  const emailInput = el('emailInput');
  const passwordInput = el('passwordInput');
  const loginBtn = el('loginBtn');
  const cancelLoginBtn = el('cancelLoginBtn');
  const showRegisterBtn = el('showRegisterBtn');
  const backToLoginBtn = el('backToLoginBtn');
  const loginError = el('loginError');

  const regEmailInput = el('regEmailInput');
  const regPasswordInput = el('regPasswordInput');
  const regConfirmPasswordInput = el('regConfirmPasswordInput');
  const registerBtn = el('registerBtn');
  const cancelRegisterBtn = el('cancelRegisterBtn');
  const registerError = el('registerError');
  const registerSuccess = el('registerSuccess');

  const commentInput = el('commentInput');
  const charCounter = el('charCounter');
  const submitCommentBtn = el('submitCommentBtn');
  const cancelCommentBtn = el('cancelCommentBtn');
  const commentError = el('commentError');
  const commentsList = el('commentsList');
  const userInfoSection = el('userInfoSection');
  const userAvatar = el('userAvatar');
  const userName = el('userName');
  const logoutBtn = el('logoutBtn');
  const totalComments = el('totalComments');
  const totalUsers = el('totalUsers');
  const commentsInfo = el('commentsInfo');

  const searchInput = el('searchInput');
  const filterBar = el('filterBar');

  // Gallery/trip modals and UI
  const galleryModal = el('galleryModal');
  const galleryCodeInput = el('galleryCode');
  const galleryError = el('galleryError');

  const tripModal = el('tripModal');
  const tripPasswordInput = el('tripPassword');
  const tripError = el('tripError');

  const personalInvitationModal = el('personalInvitationModal');
  const usernameInput = el('username');
  const passwordInvInput = el('password');
  const invitationError = el('invitationError');

  const memoriesGrid = el('memoriesGrid');
  const memoriesLock = el('memoriesLock');
  const farewellGrid = el('farewellGrid');
  const galleryLock = el('galleryLock');

  const tripGrid = el('tripGrid');
  const tripLock = el('tripLock');

  const lightbox = el('lightbox');
  const lightboxMedia = el('lightboxMedia');

  const loader = el('loader');
  const curtain = el('curtain');
  const mainContent = el('mainContent');
  const navBar = el('navBar');

  const closeGalleryBtn = el('closeGalleryBtn');

  const videoModal = el('videoModal');
  const modalVideo = el('modalVideo');

  // Audio elements
  const mainAudioEl = el('mainAudio');
  const galleryAudioEl = el('galleryAudio');
  const tripAudioEl = el('tripAudio');

  // Video book elements
  const book = document.querySelector('.book');
  const prevBtn = el('prevBtn');
  const nextBtn = el('nextBtn');

  // ========== CONFIG ==========
  const GALLERY_CODE = '12BL25';
  const TRIP_PASSWORD = '13-11-2025';

  // Personal invitation demo DB (local)
  const userDatabase = {
    'divyanshu': {
      password: 'div123',
      name: 'Divyanshu Pandey',
      pdfUrl: 'https://your-domain.com/invitations/divyanshu-invitation.pdf'
    },
    'rahul': {
      password: 'rahul456',
      name: 'Rahul Kumar',
      pdfUrl: 'https://your-domain.com/invitations/rahul-invitation.pdf'
    }
  };

  // Photo/video lists (replace as needed)
  const memoriesData = [
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(1).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(2).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(3).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(4).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(5).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(6).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(7).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(8).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(9).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(10).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(11).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(12).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(13).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(14).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(15).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(16).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(17).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(18).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(19).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(20).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(21).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(23).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(24).jpg' },
            { type: 'photo', url: 'https://cdn.jsdelivr.net/gh/CodeCr4cker/Web-Storage/Farewell-invitation-card/images/B%20L%20Academy(22).jpg' }
        ];

   const PHOTO_LINKS = [
 "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(1).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(2).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(3).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(4).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(5).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(6).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(7).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(8).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(9).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(10).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(11).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(12).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(13).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(14).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(15).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(16).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(17).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(18).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(19).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(20).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(21).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(22).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(23).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(24).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(25).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(26).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(27).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(28).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(29).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(30).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(31).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(32).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(33).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(34).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(35).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(36).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(37).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(38).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(39).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(40).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(41).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(42).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(43).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(44).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(45).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(46).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(47).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(48).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(49).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(50).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(51).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(52).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(53).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(54).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(55).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(56).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(57).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(58).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(59).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(60).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(61).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(62).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(63).jpg",
  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(64).jpg"
];

  const VIDEO_LINKS = ['https://www.w3schools.com/html/mov_bbb.mp4'];

  // Trip placeholders (user should replace)
  const TRIP_PHOTOS = [  
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(1).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(2).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(3).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(4).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(5).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(6).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(7).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(8).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(9).jpg',
        'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(10).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(11).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(12).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(13).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(14).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(15).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(16).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(17).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(18).jpg',
        'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(19).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(20).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(21).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(22).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(23).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(24).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(25).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(26).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(27).jpg',
        'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(28).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(29).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(30).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(31).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(32).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(33).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(34).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(35).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(36).jpg',
        'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(37).jpg',
       'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/trip/trip%20(38).jpg'
 ];
  const TRIP_VIDEOS = [
    'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/video/trip/trip%20(1).mp4',
    'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/video/trip/trip%20(2).mp4',
    'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/video/trip/trip%20(3).mp4',
    'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/video/trip/trip%20(4).mp4',
    'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/video/trip/trip%20(5).mp4',
    'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/video/trip/trip%20(6).mp4',
    'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/video/trip/trip%20(7).mp4',
    'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/video/trip/trip%20(8).mp4',
    'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/video/trip/trip%20(9).mp4',
    'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/video/trip/trip%20(10).mp4',
    'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/video/trip/trip%20(11).mp4',
    'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/video/trip/trip%20(12).mp4',
    'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/video/trip/trip%20(13).mp4',
    'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/video/trip/trip%20(14).mp4',
    'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/video/trip/trip%20(15).mp4',
    'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/video/trip/trip%20(16).mp4',
    'https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/video/trip/trip%20(17).mp4'
  ];

  // ========== STATE ==========
  let currentUser = null;
  let allComments = [];
  let currentFilter = 'newest';
  let currentSearchTerm = '';
  let editingCommentId = null;

  let galleryUnlocked = false;
  let tripUnlocked = false;
  let memoriesOpened = false;
  let currentTab = 'memories';

  let currentLightboxIndex = 0;
  let currentGalleryData = [];

  let mainAudio = mainAudioEl || null;
  let galleryAudio = galleryAudioEl || null;
  let tripAudio = tripAudioEl || null;

  let isMainAudioPlaying = false;
  let isGalleryAudioPlaying = false;
  let isTripAudioPlaying = false;

  // Video book state
  let allVideos = [];
  let totalPages = 0;
  let currentPage = 0;

  // ========== HELPERS ==========
  function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${escapeHtml(message)}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  // ========== AUTH & UI ==========
  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      showUserInfo(user);
    } else {
      currentUser = null;
      hideUserInfo();
    }
  });

  function showUserInfo(user) {
    if (!user) return;
    if (userInfoSection) userInfoSection.classList.remove('hide');
    const username = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
    const initial = username.charAt(0).toUpperCase();
    if (userAvatar) userAvatar.textContent = initial;
    if (userName) userName.textContent = username;
  }

  function hideUserInfo() {
    if (userInfoSection) userInfoSection.classList.add('hide');
    if (userAvatar) userAvatar.textContent = '';
    if (userName) userName.textContent = '';
  }

  // ========== MODAL HELPERS ==========
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('show', 'active');
  }
  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('show', 'active');
  }

  // LOGIN / REGISTER
  if (commentBtn) {
    commentBtn.onclick = () => {
      if (auth.currentUser) openCommentModal();
      else openLoginModal();
    };
  }

  function openLoginModal() {
    openModal(loginModal);
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
    ErrorUtils.clearError(loginError);
    if (emailInput) emailInput.focus();
  }
  function closeLoginModal() { closeModal(loginModal); }

  function openRegisterModal() {
    openModal(registerModal);
    if (regEmailInput) regEmailInput.value = '';
    if (regPasswordInput) regPasswordInput.value = '';
    if (regConfirmPasswordInput) regConfirmPasswordInput.value = '';
    ErrorUtils.clearError(registerError);
    ErrorUtils.clearError(registerSuccess);
  }
  function closeRegisterModal() { closeModal(registerModal); }

  function openCommentModal(id = null, text = '') {
    openModal(commentModal);
    if (commentInput) commentInput.value = text || '';
    editingCommentId = id;
    updateCharCounter();
    ErrorUtils.clearError(commentError);
    const modalTitle = commentModal ? commentModal.querySelector('.modal-title') : null;
    const submitBtn = submitCommentBtn;
    if (modalTitle && submitBtn) {
      if (id) {
        modalTitle.textContent = '✏️ Edit Your Comment';
        submitBtn.textContent = 'Update Comment';
      } else {
        modalTitle.textContent = '✍️ Write Your Comment';
        submitBtn.textContent = 'Post Comment';
      }
    }
    if (commentInput) commentInput.focus();
  }
  function closeCommentModal() {
    closeModal(commentModal);
    editingCommentId = null;
    if (commentInput) commentInput.value = '';
    updateCharCounter();
  }

  // Modal overlay click to close
  if (loginModal) loginModal.addEventListener('click', (e) => { if (e.target === loginModal) closeLoginModal(); });
  if (registerModal) registerModal.addEventListener('click', (e) => { if (e.target === registerModal) closeRegisterModal(); });
  if (commentModal) commentModal.addEventListener('click', (e) => { if (e.target === commentModal) closeCommentModal(); });
  if (galleryModal) galleryModal.addEventListener('click', (e) => { if (e.target === galleryModal) closeGalleryModal(); });
  if (tripModal) tripModal.addEventListener('click', (e) => { if (e.target === tripModal) closeTripModal(); });
  if (personalInvitationModal) personalInvitationModal.addEventListener('click', (e) => { if (e.target === personalInvitationModal) closePersonalInvitationModal(); });

  // Cancel buttons
  if (cancelLoginBtn) cancelLoginBtn.onclick = closeLoginModal;
  if (cancelRegisterBtn) cancelRegisterBtn.onclick = closeRegisterModal;
  if (cancelCommentBtn) cancelCommentBtn.onclick = closeCommentModal;

  // Switch login/register
  if (showRegisterBtn) showRegisterBtn.onclick = () => { closeLoginModal(); openRegisterModal(); };
  if (backToLoginBtn) backToLoginBtn.onclick = () => { closeRegisterModal(); openLoginModal(); };

  // ========== CHARACTER COUNTER ==========
  function updateCharCounter() {
    if (!charCounter || !commentInput) return;
    const length = (commentInput.value || '').length;
    charCounter.textContent = `${length} / 500`;
    if (length > 450) charCounter.classList.add('warning');
    else charCounter.classList.remove('warning');
  }
  if (commentInput) commentInput.addEventListener('input', updateCharCounter);

  // ========== REGISTER ==========
  if (registerBtn) {
    registerBtn.onclick = async function () {
      const email = regEmailInput.value.trim();
      const password = regPasswordInput.value;
      const confirmPassword = regConfirmPasswordInput.value;

      ErrorUtils.clearError(registerError);
      ErrorUtils.clearError(registerSuccess);

      if (!email || !password || !confirmPassword) {
        ErrorUtils.setError(registerError, 'Please fill in all fields');
        return;
      }
      if (password.length < 6) {
        ErrorUtils.setError(registerError, 'Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        ErrorUtils.setError(registerError, 'Passwords do not match');
        return;
      }

      registerBtn.disabled = true;
      registerBtn.textContent = 'Creating Account...';

      try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        currentUser = user;
        showUserInfo(user);
        ErrorUtils.setSuccess(registerSuccess, 'Account created successfully! Logging you in...');
        setTimeout(() => {
          closeRegisterModal();
          openCommentModal();
        }, 800);
      } catch (error) {
        let errorMsg = 'Registration failed. ';
        if (error.code === 'auth/email-already-in-use') errorMsg += 'This email is already registered.';
        else if (error.code === 'auth/invalid-email') errorMsg += 'Invalid email address.';
        else if (error.code === 'auth/weak-password') errorMsg += 'Password is too weak.';
        else errorMsg += error.message;
        ErrorUtils.setError(registerError, errorMsg);
      } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = 'Create Account';
      }
    };
  }

  // ========== LOGIN ==========
  if (loginBtn) {
    loginBtn.onclick = async function () {
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        ErrorUtils.setError(loginError, 'Please enter both email and password');
        return;
      }
      loginBtn.disabled = true;
      loginBtn.textContent = 'Logging in...';

      try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        currentUser = user;
        showUserInfo(user);
        closeLoginModal();
        openCommentModal();
      } catch (error) {
        let errorMsg = 'Login failed. ';
        if (error.code === 'auth/user-not-found') errorMsg += 'User not found.';
        else if (error.code === 'auth/wrong-password') errorMsg += 'Incorrect password.';
        else if (error.code === 'auth/invalid-email') errorMsg += 'Invalid email address.';
        else errorMsg += error.message;
        ErrorUtils.setError(loginError, errorMsg);
      } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
      }
    };
  }

  if (passwordInput) passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') loginBtn && loginBtn.click(); });
  if (regConfirmPasswordInput) regConfirmPasswordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') registerBtn && registerBtn.click(); });

  // ========== COMMENTS ==========
  if (submitCommentBtn) {
    submitCommentBtn.onclick = async function () {
      const commentText = (commentInput.value || '').trim();
      if (!commentText) {
        ErrorUtils.setError(commentError, 'Please write a comment');
        return;
      }
      const user = auth.currentUser || currentUser;
      if (!user) {
        ErrorUtils.setError(commentError, 'Please login to comment');
        return;
      }

      submitCommentBtn.disabled = true;
      submitCommentBtn.textContent = editingCommentId ? 'Updating...' : 'Posting...';

      try {
        const username = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
        if (editingCommentId) {
          const snapshot = await database.ref(`comments/${editingCommentId}/authorId`).once('value');
          if (snapshot.exists() && snapshot.val() === user.uid) {
            await database.ref(`comments/${editingCommentId}`).update({
              text: commentText,
              edited: true,
              editedAt: firebase.database.ServerValue.TIMESTAMP
            });
          } else {
            ErrorUtils.setError(commentError, 'You are not allowed to edit this comment.');
          }
        } else {
          await database.ref('comments').push({
            text: commentText,
            author: username,
            authorId: user.uid,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            likes: 0,
            likedBy: {}
          });
        }
        closeCommentModal();
      } catch (error) {
        console.error('Failed to post comment', error);
        ErrorUtils.setError(commentError, 'Failed to post comment: ' + (error.message || error));
      } finally {
        submitCommentBtn.disabled = false;
        submitCommentBtn.textContent = editingCommentId ? 'Update Comment' : 'Post Comment';
      }
    };
  }

  window.deleteComment = async function (commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    const user = auth.currentUser || currentUser;
    if (!user) { openLoginModal(); return; }
    try {
      const snapshot = await database.ref(`comments/${commentId}`).once('value');
      const comment = snapshot.val();
      if (!comment) { alert('Comment not found.'); return; }
      if (comment.authorId !== user.uid) { alert('You are not allowed to delete this comment.'); return; }
      await database.ref(`comments/${commentId}`).remove();
    } catch (error) {
      alert('Failed to delete comment: ' + error.message);
    }
  };

  window.editComment = async function (commentId, commentText) {
    const user = auth.currentUser || currentUser;
    if (!user) { openLoginModal(); return; }
    try {
      const snapshot = await database.ref(`comments/${commentId}/authorId`).once('value');
      if (snapshot.exists() && snapshot.val() === user.uid) {
        openCommentModal(commentId, commentText);
      } else {
        alert('You are not allowed to edit this comment.');
      }
    } catch (error) {
      console.error('Edit check failed', error);
      alert('Could not verify permission to edit: ' + error.message);
    }
  };

  window.toggleLike = async function (commentId) {
    const user = auth.currentUser || currentUser;
    if (!user) { openLoginModal(); return; }
    const likeRef = database.ref(`comments/${commentId}/likedBy/${user.uid}`);
    try {
      const snapshot = await likeRef.once('value');
      if (snapshot.exists()) {
        await likeRef.remove();
        await database.ref(`comments/${commentId}/likes`).transaction((likes) => (likes || 1) - 1);
      } else {
        await likeRef.set(true);
        await database.ref(`comments/${commentId}/likes`).transaction((likes) => (likes || 0) + 1);
      }
    } catch (error) {
      console.error('Like toggle failed', error);
      alert('Failed to toggle like: ' + error.message);
    }
  };

  if (logoutBtn) {
    logoutBtn.onclick = function () {
      auth.signOut().catch((error) => alert('Logout failed: ' + error.message));
    };
  }

  // Real-time comments listener
  database.ref('comments').on('value', (snapshot) => {
    const comments = [];
    snapshot.forEach(child => comments.push({ id: child.key, ...child.val() }));
    allComments = comments;
    if (totalComments) totalComments.textContent = comments.length;
    const userIds = new Set(comments.map(c => c.authorId).filter(Boolean));
    if (totalUsers) totalUsers.textContent = userIds.size;
    if (commentsInfo) commentsInfo.textContent = `${comments.length} total • ${userIds.size} contributors`;
    renderComments();
  }, (error) => {
    console.error('Failed to read comments:', error);
    if (commentsList) commentsList.innerHTML = `<div class="error-message show">Failed to load comments: ${escapeHtml(error.message || error)}</div>`;
  });

  // Search & filter
  if (searchInput) searchInput.addEventListener('input', (e) => { currentSearchTerm = e.target.value.trim().toLowerCase(); renderComments(); });
  if (filterBar) filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    [...filterBar.querySelectorAll('.filter-btn')].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter || 'newest';
    renderComments();
  });

  function renderComments() {
    try {
      let items = (allComments || []).slice();
      if (currentSearchTerm) {
        items = items.filter(c => {
          const text = (c.text || '').toLowerCase();
          const author = (c.author || '').toLowerCase();
          return text.includes(currentSearchTerm) || author.includes(currentSearchTerm);
        });
      }
      if (currentFilter === 'newest') items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      else if (currentFilter === 'oldest') items.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      else if (currentFilter === 'popular') items.sort((a, b) => (b.likes || 0) - (a.likes || 0));

      if (!commentsList) return;
      if (items.length === 0) {
        commentsList.innerHTML = '<div class="no-comments">No comments yet.</div>';
        return;
      }

      const user = auth.currentUser || currentUser;
      commentsList.innerHTML = items.map(c => {
        const time = c.timestamp ? new Date(c.timestamp).toLocaleString() : '';
        const author = c.author || (c.authorId ? 'User' : 'Anonymous');
        const safeText = escapeHtml(c.text || '');
        const avatarLetter = escapeHtml((author && author.charAt(0).toUpperCase()) || 'U');
        const isMine = user ? (c.authorId === user.uid) : false;
        const likeCount = c.likes || 0;
        let likedClass = '';
        let likedAttr = '';
        if (user && c.likedBy && c.likedBy[user.uid]) { likedClass = 'liked'; likedAttr = ' (You)'; }
        const safeTextForEdit = (c.text || '').replace(/`/g, '\\`').replace(/\\/g, '\\\\').replace(/\$/g, '\\$');
        return `
          <div class="comment-item" id="comment-${escapeHtml(c.id)}">
            <div class="comment-header">
              <div class="comment-avatar">${avatarLetter}</div>
              <div class="comment-author">${escapeHtml(author)}</div>
              <div class="comment-time">${escapeHtml(time)}</div>
            </div>
            <div class="comment-text">${safeText}</div>
            <div class="comment-actions">
              <button class="action-btn ${likedClass}" onclick="toggleLike('${escapeHtml(c.id)}')">👍 ${likeCount}${likedAttr}</button>
              ${isMine ? `<button class="action-btn" onclick="editComment('${escapeHtml(c.id)}', \`${escapeHtml(safeTextForEdit)}\`)">Edit</button>
              <button class="action-btn" onclick="deleteComment('${escapeHtml(c.id)}')">Delete</button>` : ''}
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      console.error('Render failed', err);
      if (commentsList) commentsList.innerHTML = `<div class="error-message show">Failed to render comments: ${escapeHtml(err.message || err)}</div>`;
    }
  }

  // ========== LOADER / CURTAIN / STARTUP ==========
  window.addEventListener('load', () => {
    // fade loader and show curtain
    if (loader) {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; if (curtain) curtain.classList.add('visible'); }, 500);
      }, 2000);
    }

    // init audio refs
    mainAudio = mainAudioEl;
    galleryAudio = galleryAudioEl;
    tripAudio = tripAudioEl;

    // init video book after DOM ready
    initVideoBook();

    // load small UI pieces
    loadMemoriesGallery();
    startCountdown();
  });

  if (curtain) {
    curtain.addEventListener('click', function () {
      this.classList.add('open');
      if (mainAudio) {
        mainAudio.play().then(() => { isMainAudioPlaying = true; }).catch(e => console.log('Audio play failed:', e));
      }
      setTimeout(() => {
        this.style.display = 'none';
        if (mainContent) mainContent.classList.add('visible');
        if (navBar) navBar.classList.add('visible');
        setTimeout(() => { const home = el('home'); if (home) home.classList.add('visible'); }, 100);
        observeSection();
        createParticles();
        snow();
      }, 2000);
    });
  }

  // ========== PARTICLES / CONFETTI ==========
  function snow() {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    function frame() {
      confetti({
        particleCount: 1,
        startVelocity: 0,
        ticks: 200,
        origin: { x: Math.random(), y: -0.1 },
        colors: ['#ffd700', '#ff6b6b', '#4ecdc4'],
        shapes: ['circle'],
        gravity: 0.5,
        scalar: 0.8,
        drift: 0
      });
      if (Date.now() < animationEnd) requestAnimationFrame(frame);
    }
    frame();
  }

  function createParticles() {
    const particlesContainer = el('particles');
    if (!particlesContainer) return;
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 6 + 's';
      particle.style.animationDuration = Math.random() * 4 + 4 + 's';
      const colors = ['rgba(255, 215, 0, 0.6)', 'rgba(255, 107, 107, 0.6)', 'rgba(78, 205, 196, 0.6)'];
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particlesContainer.appendChild(particle);
    }
  }

  // ========== OBSERVERS ==========
  function observeSection() {
    const galleryEl = el('gallery');
    if (!galleryEl) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    observer.observe(galleryEl);
  }

  // ========== COUNTDOWN ==========
  function startCountdown() {
    const countDownDate = new Date('dec 14, 2025 13:25:00').getTime();
    const timer = setInterval(() => {
      const now = Date.now();
      const distance = countDownDate - now;
      if (distance < 0) { clearInterval(timer); displayCountdownFinished(); return; }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      const countdown = el('countdown');
      if (countdown) {
        countdown.innerHTML = `
          <div class="countdown-item"><span class="countdown-number">${String(days).padStart(2,'0')}</span><span class="countdown-label">Days</span></div>
          <div class="countdown-item"><span class="countdown-number">${String(hours).padStart(2,'0')}</span><span class="countdown-label">Hours</span></div>
          <div class="countdown-item"><span class="countdown-number">${String(minutes).padStart(2,'0')}</span><span class="countdown-label">Minutes</span></div>
          <div class="countdown-item"><span class="countdown-number">${String(seconds).padStart(2,'0')}</span><span class="countdown-label">Seconds</span></div>
        `;
      }
    }, 1000);
  }
  function displayCountdownFinished() {
    const container = el('countdownContainer');
    if (!container) return;
    container.innerHTML = `
      <div style="background: rgba(139, 92, 246, 0.15); border: 2px solid var(--accent-gold); border-radius: 20px; padding: 2rem; margin: 3rem 0; height:27rem; width:23rem">
         <img src=  "https://raw.githubusercontent.com/CodeCr4cker/Web-Storage/main/Farewell-invitation-card/images/Farewell/farewell%20(42).jpg" style="width:300px; height:200px;">
        <p style="font-size: 1.2rem; color: var(--text-light); margin: 0.5rem 0;">Hope you had an amazing time at the farewell!</p>
        <p style="margin-top: 1rem;">Thank you for being part of this incredible journey. May all your dreams come true! 💫</p>
      </div>
    `;
  }

  // ========== VIDEO BOOK ==========
  function initVideoBook() {
    if (!book) return;
    book.style.setProperty('--c', 0);
    allVideos = Array.from(book.querySelectorAll('video'));
    const pages = book.querySelectorAll('.page');
    totalPages = pages.length - 1;
    pages.forEach((page, idx) => {
      page.style.setProperty('--i', idx);
      page.addEventListener('click', (evt) => {
        if (evt.target.closest('video') || evt.target.closest('.play-overlay')) return;
        const curr = evt.target.closest('.back') ? idx : idx + 1;
        goToPage(curr);
      });
    });

    // Play overlay -> open video modal
    document.querySelectorAll('.play-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        const video = overlay.previousElementSibling;
        const srcEl = video ? video.querySelector('source') : null;
        const src = srcEl ? srcEl.src : (video ? video.src : '');
        if (src) openVideoModal(src);
      });
    });

    // disable contextmenu on videos
    document.querySelectorAll('video').forEach(video => video.addEventListener('contextmenu', e => e.preventDefault()));

    if (prevBtn) prevBtn.addEventListener('click', () => { if (currentPage > 0) goToPage(currentPage - 1); });
    if (nextBtn) nextBtn.addEventListener('click', () => { if (currentPage < totalPages + 1) goToPage(currentPage + 1); });

    observeBookSection();
  }

  function observeBookSection() {
    const bookSection = document.querySelector('.book-container');
    const navArrows = document.querySelector('.nav-arrows');
    if (!bookSection || !navArrows) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) navArrows.classList.add('visible'); else navArrows.classList.remove('visible'); });
    }, { threshold: 0.3 });
    observer.observe(bookSection);
  }

  function goToPage(pageNum) {
    if (pageNum < 0) return;
    currentPage = pageNum;
    if (book) book.style.setProperty('--c', currentPage);
    if (prevBtn) prevBtn.disabled = currentPage === 0;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages + 1;
    handleVideoPlayback(currentPage);
    if (currentPage === totalPages + 1) {
      setTimeout(() => {
        book.classList.add('closed');
        setTimeout(() => {
          currentPage = 0;
          book.style.setProperty('--c', 0);
          book.classList.remove('closed');
          if (prevBtn) prevBtn.disabled = true;
          if (nextBtn) nextBtn.disabled = false;
          handleVideoPlayback(0);
        }, 2000);
      }, 1000);
    }
  }
  function handleVideoPlayback() {
    allVideos.forEach(video => {
      const overlay = video.parentElement.querySelector('.play-overlay');
      if (overlay) overlay.classList.remove('hidden');
    });
  }

  // Video modal open/close
  function openVideoModal(videoSrc) {
    if (!videoModal || !modalVideo) return;
    if (isMainAudioPlaying && mainAudio) { mainAudio.pause(); isMainAudioPlaying = false; }
    if (isGalleryAudioPlaying && galleryAudio) { galleryAudio.pause(); isGalleryAudioPlaying = false; }
    if (isTripAudioPlaying && tripAudio) { tripAudio.pause(); isTripAudioPlaying = false; }
    modalVideo.src = videoSrc;
    videoModal.classList.add('active');
    modalVideo.play().catch(console.log);
    modalVideo.addEventListener('ended', handleVideoModalEnd);
    modalVideo.addEventListener('pause', handleVideoModalPause);
  }
  function closeVideoModal() {
    if (!videoModal || !modalVideo) return;
    modalVideo.pause();
    modalVideo.currentTime = 0;
    modalVideo.src = '';
    videoModal.classList.remove('active');
    modalVideo.removeEventListener('ended', handleVideoModalEnd);
    modalVideo.removeEventListener('pause', handleVideoModalPause);
    resumeAudioAfterVideoModal();
  }
  function handleVideoModalEnd() { setTimeout(closeVideoModal, 500); }
  function handleVideoModalPause() {
    if (!modalVideo) return;
    if (modalVideo.currentTime === modalVideo.duration || modalVideo.ended) resumeAudioAfterVideoModal();
  }
  function resumeAudioAfterVideoModal() {
    if (currentTab === 'trip' && tripUnlocked && tripAudio) {
      // resume trip audio
      playTripAudio();
    } else if (currentTab === 'farewell' && galleryUnlocked && galleryAudio) {
      galleryAudio.play().then(() => isGalleryAudioPlaying = true).catch(console.log);
    } else if (mainAudio) {
      mainAudio.play().then(() => isMainAudioPlaying = true).catch(console.log);
    }
  }

  // ========== GALLERY / LIGHTBOX ==========
  function loadMemoriesGallery() {
    if (!memoriesGrid) return;
    memoriesGrid.innerHTML = '';
    (memoriesData || []).forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'polaroid-card';
      card.onclick = () => openLightbox(index, memoriesData);
      card.innerHTML = `<img src="${item.url}" alt="Memory ${index + 1}" class="polaroid-img">`;
      memoriesGrid.appendChild(card);
    });
  }

  function generateFarewellData() {
    const items = [];
    (PHOTO_LINKS || []).forEach((url, index) => items.push({ type: 'photo', url, title: `Memory ${index + 1}`, desc: 'Special farewell moment' }));
    (VIDEO_LINKS || []).forEach((url, index) => items.push({ type: 'video', url, title: `Video ${index + 1}`, desc: 'Farewell highlights' }));
    return items;
  }

  function openMemoriesGallery() {
    memoriesOpened = true;
    if (memoriesLock) memoriesLock.classList.add('hidden');
    if (memoriesGrid) memoriesGrid.classList.add('visible');
    if (closeGalleryBtn) { closeGalleryBtn.classList.add('visible'); closeGalleryBtn.onclick = closeMemoriesGallery; }
  }
  function closeMemoriesGallery() {
    memoriesOpened = false;
    if (memoriesLock) memoriesLock.classList.remove('hidden');
    if (memoriesGrid) memoriesGrid.classList.remove('visible');
    if (closeGalleryBtn) closeGalleryBtn.classList.remove('visible');
  }

  function switchGalleryTab(tab, evt) {
    currentTab = tab;
    document.querySelectorAll('.gallery-nav-btn').forEach(btn => btn.classList.remove('active'));
    if (evt && evt.currentTarget) evt.currentTarget.classList.add('active');
    else {
      const btn = document.querySelector(`.gallery-nav-btn[data-tab="${tab}"]`);
      if (btn) btn.classList.add('active');
    }
    document.querySelectorAll('.gallery-tab').forEach(tabEl => tabEl.classList.remove('active'));

    if (tab === 'memories') {
      const memTab = el('memoriesTab');
      if (memTab) memTab.classList.add('active');
      if (memoriesOpened) {
        if (closeGalleryBtn) { closeGalleryBtn.classList.add('visible'); closeGalleryBtn.onclick = closeMemoriesGallery; }
      } else { if (closeGalleryBtn) closeGalleryBtn.classList.remove('visible'); }
      if (galleryUnlocked && isGalleryAudioPlaying) switchAudioToMain();
    } else if (tab === 'farewell') {
      const fareTab = el('farewellTab');
      if (fareTab) fareTab.classList.add('active');
      if (galleryUnlocked) {
        if (closeGalleryBtn) { closeGalleryBtn.classList.add('visible'); closeGalleryBtn.onclick = closeFarewellGallery; }
        if (isMainAudioPlaying) switchAudioToGallery();
      } else { if (closeGalleryBtn) closeGalleryBtn.classList.remove('visible'); }
    } else if (tab === 'trip') {
      const t = el('tripTab');
      if (t) t.classList.add('active');
      if (tripUnlocked) {
        if (closeGalleryBtn) { closeGalleryBtn.classList.add('visible'); closeGalleryBtn.onclick = closeTripGallery; }
        if (!isTripAudioPlaying) playTripAudio();
      } else { if (closeGalleryBtn) closeGalleryBtn.classList.remove('visible'); }
    }
  }
  // Expose to inline onclick usage
  window.switchGalleryTab = switchGalleryTab;

  function openGalleryModal() {
    openModal(galleryModal);
    if (galleryCodeInput) galleryCodeInput.focus();
  }
  function closeGalleryModal() {
    closeModal(galleryModal);
    if (galleryCodeInput) galleryCodeInput.value = '';
    if (galleryError) galleryError.style.display = 'none';
  }

  function verifyGalleryCode() {
    if (!galleryCodeInput) return;
    const code = galleryCodeInput.value.trim().toUpperCase();
    if (code === GALLERY_CODE) {
      galleryUnlocked = true;
      closeGalleryModal();
      unlockGallery();
      showSuccessNotification('Gallery Unlocked Successfully!');
    } else {
      if (galleryError) galleryError.style.display = 'block';
      galleryCodeInput.value = '';
      setTimeout(() => { if (galleryError) galleryError.style.display = 'none'; }, 3000);
    }
  }
  window.openGalleryModal = openGalleryModal;
  window.verifyGalleryCode = verifyGalleryCode;
  window.closeGalleryModal = closeGalleryModal;

  function unlockGallery() {
    galleryUnlocked = true;
    if (galleryLock) galleryLock.classList.add('hidden');
    if (farewellGrid) farewellGrid.style.display = 'grid';
    if (closeGalleryBtn) { closeGalleryBtn.classList.add('visible'); closeGalleryBtn.onclick = closeFarewellGallery; }
    if (isMainAudioPlaying) switchAudioToGallery();
    const farewellData = generateFarewellData();
    if (!farewellGrid) return;
    farewellGrid.innerHTML = '';
    farewellData.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `media-card ${item.type}`;
      card.onclick = () => openLightbox(index, farewellData);
      const mediaHtml = item.type === 'video' ? `<video src="${item.url}"></video><div class="play-icon">▶</div>` : `<img src="${item.url}" alt="${escapeHtml(item.title)}">`;
      card.innerHTML = `<div class="media-content">${mediaHtml}<div class="media-overlay"><div class="media-title">${escapeHtml(item.title)}</div><div class="media-desc">${escapeHtml(item.desc)}</div></div></div>`;
      farewellGrid.appendChild(card);
    });
  }

  function closeFarewellGallery() {
    galleryUnlocked = false;
    if (galleryLock) galleryLock.classList.remove('hidden');
    if (farewellGrid) { farewellGrid.style.display = 'none'; farewellGrid.innerHTML = ''; }
    currentTab = 'memories';
    document.querySelectorAll('.gallery-nav-btn').forEach((btn, index) => { if (index === 0) btn.classList.add('active'); else btn.classList.remove('active'); });
    document.querySelectorAll('.gallery-tab').forEach(tabEl => tabEl.classList.remove('active'));
    const memTab = el('memoriesTab'); if (memTab) memTab.classList.add('active');
    if (memoriesOpened) { if (closeGalleryBtn) { closeGalleryBtn.classList.add('visible'); closeGalleryBtn.onclick = closeMemoriesGallery; } } else { if (closeGalleryBtn) closeGalleryBtn.classList.remove('visible'); }
    if (isGalleryAudioPlaying) switchAudioToMain();
    showSuccessNotification('Farewell Gallery Locked.');
  }

  // ========== AUDIO CROSSFADE ==========
  function switchAudioToGallery() {
    if (!mainAudio || !galleryAudio) return;
    let mainVolume = mainAudio.volume || 1;
    const fadeOutMain = setInterval(() => {
      if (mainVolume > 0.05) {
        mainVolume -= 0.05;
        mainAudio.volume = Math.max(0, mainVolume);
      } else {
        mainAudio.pause();
        mainAudio.volume = 1;
        isMainAudioPlaying = false;
        clearInterval(fadeOutMain);
        galleryAudio.play().then(() => isGalleryAudioPlaying = true).catch(e => console.log('Gallery audio play failed:', e));
      }
    }, 50);
  }

  function switchAudioToMain() {
    if (!mainAudio || !galleryAudio) return;
    let galleryVolume = galleryAudio.volume || 1;
    const fadeOutGallery = setInterval(() => {
      if (galleryVolume > 0.05) {
        galleryVolume -= 0.05;
        galleryAudio.volume = Math.max(0, galleryVolume);
      } else {
        galleryAudio.pause();
        galleryAudio.volume = 1;
        isGalleryAudioPlaying = false;
        clearInterval(fadeOutGallery);
        mainAudio.play().then(() => isMainAudioPlaying = true).catch(e => console.log('Main audio play failed:', e));
      }
    }, 50);
  }

  // ========== LIGHTBOX (photo/video) ==========
  function openLightbox(index, data) {
    currentLightboxIndex = index;
    currentGalleryData = data;
    if (!lightbox || !lightboxMedia) return;
    const item = data[index];
    if (!item) return;
    if (item.type === 'video') {
      if (isMainAudioPlaying && mainAudio) mainAudio.pause();
      if (isGalleryAudioPlaying && galleryAudio) galleryAudio.pause();
      if (isTripAudioPlaying && tripAudio) tripAudio.pause();
      lightboxMedia.innerHTML = `<video src="${item.url}" controls autoplay style="max-width: 90vw; max-height: 80vh;"></video>`;
      const videoElement = lightboxMedia.querySelector('video');
      if (videoElement) {
        if (currentTab === 'trip') {
          videoElement.addEventListener('ended', resumeTripAudio);
          videoElement.addEventListener('pause', resumeTripAudio);
        } else {
          videoElement.addEventListener('ended', resumeAudioAfterVideo);
          videoElement.addEventListener('pause', resumeAudioAfterVideo);
        }
      }
    } else {
      lightboxMedia.innerHTML = `<img src="${item.url}" alt="${escapeHtml(item.title || 'Memory')}">`;
    }
    lightbox.classList.add('active');
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    const video = lightbox.querySelector('video');
    if (video) {
      video.pause();
      video.currentTime = 0;
      if (currentTab === 'trip') {
        video.removeEventListener('ended', resumeTripAudio);
        video.removeEventListener('pause', resumeTripAudio);
        resumeTripAudio();
      } else {
        video.removeEventListener('ended', resumeAudioAfterVideo);
        video.removeEventListener('pause', resumeAudioAfterVideo);
        resumeAudioAfterVideo();
      }
    } else {
      // if image, just resume appropriate audio
      resumeAudioAfterVideo();
    }
  }
  window.openLightbox = openLightbox;
  window.closeLightbox = closeLightbox;

  function resumeAudioAfterVideo() {
    if (currentTab === 'trip' && tripUnlocked && tripAudio) {
      tripAudio.play().then(() => isTripAudioPlaying = true).catch(console.log);
    } else if (currentTab === 'farewell' && galleryUnlocked && galleryAudio) {
      galleryAudio.play().then(() => isGalleryAudioPlaying = true).catch(console.log);
    } else if (mainAudio) {
      mainAudio.play().then(() => isMainAudioPlaying = true).catch(console.log);
    }
  }

  // ========== PERSONAL INVITATION ==========
  function openPersonalInvitationModal() {
    openModal(personalInvitationModal);
    if (usernameInput) usernameInput.focus();
  }
  function closePersonalInvitationModal() {
    closeModal(personalInvitationModal);
    if (usernameInput) usernameInput.value = '';
    if (passwordInvInput) passwordInvInput.value = '';
    if (invitationError) invitationError.style.display = 'none';
  }
  window.openPersonalInvitationModal = openPersonalInvitationModal;
  window.closePersonalInvitationModal = closePersonalInvitationModal;

  function generatePersonalInvitation() {
    if (!usernameInput || !passwordInvInput) return;
    const username = usernameInput.value.trim().toLowerCase();
    const password = passwordInvInput.value.trim();
    const user = userDatabase[username];
    if (!user || user.password !== password) {
      if (invitationError) invitationError.style.display = 'block';
      setTimeout(() => { if (invitationError) invitationError.style.display = 'none'; }, 3000);
      return;
    }
    downloadPDF(user.pdfUrl, `Farewell_Invitation_${user.name.replace(/\s+/g, '_')}.pdf`);
    closePersonalInvitationModal();
    showSuccessNotification(`Personal Invitation for ${user.name} Downloaded!`);
  }
  window.generatePersonalInvitation = generatePersonalInvitation;

  function downloadPDF(pdfUrl, filename) {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ========== GALLERY CODE INPUT FORMATTING ==========
  if (galleryCodeInput) galleryCodeInput.addEventListener('input', function () {
    this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  });

  // ========== TRIP GALLERY ==========
  function generateTripData() {
    const items = [];
    (TRIP_PHOTOS || []).forEach((url, i) => items.push({ type: 'photo', url, title: `Trip Photo ${i + 1}`, desc: 'Amazing moment from our trip' }));
    (TRIP_VIDEOS || []).forEach((url, i) => items.push({ type: 'video', url, title: `Trip Video ${i + 1}`, desc: 'Memorable video from the trip' }));
    return items;
  }

  function openTripModal() {
    openModal(tripModal);
    if (tripPasswordInput) tripPasswordInput.focus();
  }
  function closeTripModal() {
    closeModal(tripModal);
    if (tripPasswordInput) tripPasswordInput.value = '';
    if (tripError) tripError.style.display = 'none';
  }
  window.openTripModal = openTripModal;
  window.closeTripModal = closeTripModal;

  function verifyTripPassword() {
    if (!tripPasswordInput) return;
    const password = tripPasswordInput.value.trim();
    if (password === TRIP_PASSWORD) {
      tripUnlocked = true;
      closeTripModal();
      unlockTripGallery();
      showSuccessNotification('🎉 Trip Gallery Unlocked Successfully!');
    } else {
      if (tripError) tripError.style.display = 'block';
      tripPasswordInput.value = '';
      setTimeout(() => { if (tripError) tripError.style.display = 'none'; }, 3000);
    }
  }
  window.verifyTripPassword = verifyTripPassword;

  function unlockTripGallery() {
    tripUnlocked = true;
    if (tripLock) tripLock.classList.add('hidden');
    if (tripGrid) tripGrid.style.display = 'grid';
    if (closeGalleryBtn) { closeGalleryBtn.classList.add('visible'); closeGalleryBtn.onclick = closeTripGallery; }
    // When trip audio activates, main audio should be stopped/faded out
    playTripAudio();
    const tripData = generateTripData();
    if (!tripGrid) return;
    tripGrid.innerHTML = '';
    tripData.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'trip-card';
      card.onclick = () => openLightbox(index, tripData);
      const mediaHtml = item.type === 'video'
        ? `<video src="${item.url}"></video><div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 3rem; color: white; pointer-events: none;"><i class="fas fa-play-circle"></i></div>`
        : `<img src="${item.url}" alt="${escapeHtml(item.title)}">`;
      card.innerHTML = `${mediaHtml}<div class="trip-overlay"><div class="trip-title">${escapeHtml(item.title)}</div><div style="color: var(--text-muted); font-size: 0.9rem;">${escapeHtml(item.desc)}</div></div>`;
      tripGrid.appendChild(card);
    });
  }

  function closeTripGallery() {
    // No confirmation - close immediately when clicked (requested change)
    tripUnlocked = false;
    if (tripLock) tripLock.classList.remove('hidden');
    if (tripGrid) { tripGrid.style.display = 'none'; tripGrid.innerHTML = ''; }
    if (closeGalleryBtn) closeGalleryBtn.classList.remove('visible');
    // Stop trip audio and automatically reactivate main audio
    stopTripAudio();
    currentTab = 'memories';
    document.querySelectorAll('.gallery-nav-btn').forEach((btn, index) => { if (index === 0) btn.classList.add('active'); else btn.classList.remove('active'); });
    document.querySelectorAll('.gallery-tab').forEach(tabEl => tabEl.classList.remove('active'));
    const memTab = el('memoriesTab'); if (memTab) memTab.classList.add('active');
    showSuccessNotification('Trip Gallery Locked');
  }
  window.closeTripGallery = closeTripGallery;

  // When trip audio should start: fade out main audio (if playing) and start trip audio.
  function playTripAudio() {
    if (!tripAudio) return;
    if (isTripAudioPlaying) return;
    // If main audio is currently playing, fade it out then start trip audio
    if (mainAudio && isMainAudioPlaying) {
      let vol = mainAudio.volume ?? 1;
      const fade = setInterval(() => {
        if (vol > 0.05) {
          vol -= 0.05;
          mainAudio.volume = Math.max(0, vol);
        } else {
          mainAudio.pause();
          mainAudio.volume = 1;
          isMainAudioPlaying = false;
          clearInterval(fade);
          tripAudio.play().then(() => { isTripAudioPlaying = true; }).catch(e => console.log('Trip audio play failed:', e));
        }
      }, 50);
    } else {
      // No main audio playing - just play trip audio
      tripAudio.play().then(() => { isTripAudioPlaying = true; }).catch(e => console.log('Trip audio play failed:', e));
    }
  }

  // Stop trip audio with a fade and resume main audio automatically
  function stopTripAudio() {
    if (!tripAudio) return;
    if (isTripAudioPlaying) {
      let volume = tripAudio.volume || 1;
      const fadeOut = setInterval(() => {
        if (volume > 0.05) { volume -= 0.05; tripAudio.volume = Math.max(0, volume); }
        else {
          try { tripAudio.pause(); } catch (e) { /* ignore */ }
          tripAudio.volume = 1;
          isTripAudioPlaying = false;
          clearInterval(fadeOut);
          // After stopping trip audio, automatically resume main audio
          if (mainAudio) {
            mainAudio.play().then(() => { isMainAudioPlaying = true; }).catch(e => console.log('Main audio resume failed:', e));
          }
        }
      }, 50);
    } else {
      // Not playing - still ensure main audio is resumed
      if (mainAudio && !isMainAudioPlaying) {
        mainAudio.play().then(() => { isMainAudioPlaying = true; }).catch(e => console.log('Main audio resume failed:', e));
      }
    }
  }
  function resumeTripAudio() {
    if (tripUnlocked && currentTab === 'trip' && !isTripAudioPlaying) playTripAudio();
  }

  // ========== KEYBOARD & GLOBAL EVENT HANDLERS ==========
  document.addEventListener('keydown', (e) => {
    if (videoModal && videoModal.classList.contains('active')) {
      if (e.key === 'Escape') closeVideoModal();
      return;
    }
    const isLightboxActive = lightbox && lightbox.classList.contains('active');
    const isGalleryModalActive = galleryModal && galleryModal.classList.contains('active');
    const isInvitationActive = personalInvitationModal && personalInvitationModal.classList.contains('active');
    const isTripModalActive = tripModal && tripModal.classList.contains('active');

    if (!isLightboxActive && !isGalleryModalActive && !isInvitationActive && !isTripModalActive) {
      if (e.key === 'ArrowRight') nextBtn && nextBtn.click();
      else if (e.key === 'ArrowLeft') prevBtn && prevBtn.click();
    }

    if (isLightboxActive && e.key === 'Escape') closeLightbox();
    if (isGalleryModalActive) {
      if (e.key === 'Enter') verifyGalleryCode();
      if (e.key === 'Escape') closeGalleryModal();
    }
    if (isInvitationActive) {
      if (e.key === 'Enter') generatePersonalInvitation();
      if (e.key === 'Escape') closePersonalInvitationModal();
    }
    if (isTripModalActive) {
      if (e.key === 'Enter') verifyTripPassword();
      if (e.key === 'Escape') closeTripModal();
    }
  });

  if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  if (videoModal) videoModal.addEventListener('click', (e) => { if (e.target === videoModal) closeVideoModal(); });
  if (tripModal) tripModal.addEventListener('click', (e) => { if (e.target === tripModal) closeTripModal(); });

  // Smooth scroll for anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Pause/resume audio on visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (isMainAudioPlaying && mainAudio) mainAudio.pause();
      if (isGalleryAudioPlaying && galleryAudio) galleryAudio.pause();
      if (isTripAudioPlaying && tripAudio) tripAudio.pause();
    } else {
      if (!galleryUnlocked && isMainAudioPlaying && mainAudio) mainAudio.play().catch(console.log);
      if (galleryUnlocked && isGalleryAudioPlaying && galleryAudio) galleryAudio.play().catch(console.log);
      if (tripUnlocked && isTripAudioPlaying && tripAudio) tripAudio.play().catch(console.log);
    }
  });

  // ========== LIGHTBOX/OVERLAY CLICK SAFE HANDLERS (already added above) ==========
  // No-op here.

  // ========== FINAL CONSOLE EASTER EGG ==========
  console.log('%cFarewell 2025 🎉', 'color: #ffd700; font-size: 24px; font-weight: bold;');
  console.log('%cAccess Code: 12BL25', 'color: #4ecdc4; font-size: 16px;');
  console.log('%cMade with ❤️ by Divyanshu Pandey', 'color: #8b5cf6; font-size: 14px;');

  // ========== EXPORT SOME FUNCTIONS FOR inline onclick usage in markup ==========
  window.openMemoriesGallery = openMemoriesGallery;
  window.closeMemoriesGallery = closeMemoriesGallery;
  window.openGalleryModal = openGalleryModal;
  window.openTripModal = openTripModal;
  window.openPersonalInvitationModal = openPersonalInvitationModal;
  window.openVideoModal = openVideoModal;
  window.closeVideoModal = closeVideoModal;
  window.openLightbox = openLightbox;
  window.closeLightbox = closeLightbox;


})();


