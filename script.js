// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCdvUKN6JfqoygkxYpGV9l7v1npRhHFHkU",
  authDomain: "smartgrades-ia.firebaseapp.com",
  databaseURL: "https://smartgrades-ia-default-rtdb.firebaseio.com",
  projectId: "smartgrades-ia",
  storageBucket: "smartgrades-ia.appspot.com",
  messagingSenderId: "419252153181",
  appId: "1:419252153181:web:0ae738213e6a589f7d96b4"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

let currentUser = null;

// Elements
const loginSection = document.getElementById('login-section');
const appSection = document.getElementById('app-section');
const userEmailSpan = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const registerBtn = document.getElementById('register-btn');
const loginBtn = document.getElementById('login-btn');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const authMessage = document.getElementById('auth-message');
const addGradeBtn = document.getElementById('add-grade-btn');

// Auth state
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    loginSection.style.display = 'none';
    appSection.style.display = 'block';
    userEmailSpan.textContent = user.email;
    loadGrades();
  } else {
    currentUser = null;
    loginSection.style.display = 'block';
    appSection.style.display = 'none';
  }
});

// Register
registerBtn.addEventListener('click', (e) => {
  e.preventDefault();
  auth.createUserWithEmailAndPassword(loginEmail.value, loginPassword.value)
    .then(() => showMessage('Conta criada com sucesso!', 'success'))
    .catch((error) => showMessage(error.message, 'error'));
});

// Login
loginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signInWithEmailAndPassword(loginEmail.value, loginPassword.value)
    .then(() => showMessage('Logado!', 'success'))
    .catch((error) => showMessage(error.message, 'error'));
});

// Logout
logoutBtn.addEventListener('click', () => auth.signOut());

// Add grade
addGradeBtn.addEventListener('click', () => {
  const subject = document.getElementById('subject').value;
  const bimester = document.getElementById('bimester').value;
  const grade = document.getElementById('grade').value;
  const presence = document.getElementById('presence').value;

  if (!subject || !grade || !bimester || !presence) {
    return alert('Preencha matéria, bimestre, nota e presença');
  }

  const gradesRef = db.ref('users/' + currentUser.uid + '/grades');
  const newGradeRef = gradesRef.push();
  newGradeRef.set({
    subject,
    bimester: parseInt(bimester),
    grade: parseFloat(grade),
    presence: parseFloat(presence)
  });

  document.getElementById('subject').value = '';
  document.getElementById('bimester').value = '';
  document.getElementById('grade').value = '';
  document.getElementById('presence').value = '';
});

// Delete grade
window.deleteGrade = function(id) {
  const gradeRef = db.ref('users/' + currentUser.uid + '/grades/' + id);
  gradeRef.remove();
};

// Load grades
function loadGrades() {
  const gradesRef = db.ref('users/' + currentUser.uid + '/grades');
  gradesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    const gradesList = document.getElementById('grades-list');
    gradesList.innerHTML = '';

    if (data) {
      const materias = {};
      Object.entries(data).forEach(([id, n]) => {
        if (!materias[n.subject]) materias[n.subject] = [];
        materias[n.subject].push({ ...n, id });
      });

      Object.keys(materias).forEach((materia) => {
        const notas = materias[materia];

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<h3>${materia}</h3>`;
        gradesList.appendChild(card);

        notas.forEach(n => {
          const notaDiv = document.createElement('div');
          notaDiv.innerHTML = `
            <p>Bimestre ${n.bimester}: Nota ${n.grade} | Presença ${n.presence}%</p>
            <button onclick="deleteGrade('${n.id}')">Excluir</button>
          `;
          card.appendChild(notaDiv);
        });

        const mediaMateria = (notas.reduce((acc, n) => acc + n.grade, 0) / notas.length).toFixed(2);
        const mediaDiv = document.createElement('div');
        mediaDiv.innerHTML = `<h4>Média de ${materia}: ${mediaMateria}</h4>`;
        card.appendChild(mediaDiv);

        let dica = '';
        if (mediaMateria < 5) {
          dica = 'Reforce os estudos diariamente, revise a matéria e peça ajuda ao professor.';
        } else if (mediaMateria < 7) {
          dica = 'Você está quase lá! Faça resumos e exercícios extras para consolidar.';
        } else {
          dica = 'Ótimo desempenho! Continue mantendo a disciplina e revisando conteúdos.';
        }
        const dicaDiv = document.createElement('div');
        dicaDiv.innerHTML = `<p><b>Dica:</b> ${dica}</p>`;
        card.appendChild(dicaDiv);

        const canvas = document.createElement('canvas');
        card.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
          type: 'pie',
          data: {
            labels: notas.map(n => `Bim ${n.bimester}`),
            datasets: [{
              data: notas.map(n => n.grade),
              backgroundColor: ['#3498db', '#f39c12', '#2ecc71', '#e74c3c']
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'bottom' }
            }
          }
        });
      });
    } else {
      gradesList.innerHTML = '<p>Nenhuma nota cadastrada ainda.</p>';
    }
  });
}

// Show message
function showMessage(msg, type) {
  if (authMessage) {
    authMessage.textContent = msg;
    authMessage.style.color = type === 'error' ? 'red' : 'lightgreen';
  }
}
