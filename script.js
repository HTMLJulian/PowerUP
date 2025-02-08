// Beim Laden der Seite prüfen wir, ob ein Workout existiert
document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("workout")) {
      document.getElementById("setup-screen").classList.remove("hidden");
  } else {
      checkAndResetDailyWorkout();
      loadWorkout();
  }
});

// Überprüfen, ob ein neuer Tag begonnen hat und das Workout zurücksetzen
function checkAndResetDailyWorkout() {
  const lastAccessDate = localStorage.getItem("lastAccessDate");
  const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  if (lastAccessDate !== today) {
      // Setze das Workout aus dem original gespeicherten Workout zurück, falls vorhanden
      const originalWorkout = JSON.parse(localStorage.getItem("originalWorkout"));
      if (originalWorkout) {
          localStorage.setItem("workout", JSON.stringify(originalWorkout));
      }
      localStorage.setItem("lastAccessDate", today);
  }
}

// Automatisches Workout generieren
function generateWorkout() {
  const weight = parseInt(document.getElementById("user-weight").value);
  const age = parseInt(document.getElementById("user-age").value);
  const time = parseInt(document.getElementById("user-time").value);

  if (isNaN(weight) || isNaN(age) || isNaN(time) || time <= 0) {
      alert("Bitte gültige Werte eingeben!");
      return;
  }

  const workout = createWorkout(time);
  localStorage.setItem("userInfo", JSON.stringify({ weight, age, time }));
  localStorage.setItem("originalWorkout", JSON.stringify(workout)); // Originales Workout speichern
  localStorage.setItem("workout", JSON.stringify(workout));
  localStorage.setItem("lastAccessDate", new Date().toISOString().split("T")[0]); // Datum speichern

  loadWorkout();
}

// Automatisches Workout erstellen
function createWorkout(totalMinutes) {
  const exercises = [
      { name: "Liegestütze", time: 30, description: "Mache eine saubere Liegestütz-Position und senke dich kontrolliert ab." },
      { name: "Kniebeugen", time: 45, description: "Halte den Rücken gerade und gehe tief in die Knie." },
      { name: "Plank", time: 60, description: "Halte eine stabile Unterarmstütz-Position." },
      { name: "Jumping Jacks", time: 30, description: "Springe mit den Beinen auseinander und klatsche die Hände über dem Kopf zusammen." },
      { name: "Lunges", time: 45, description: "Mache einen großen Ausfallschritt und senke das hintere Knie fast bis zum Boden." },
      { name: "Bauch-Crunches", time: 30, description: "Hebe die Schultern leicht an, ohne den Kopf mit den Händen zu ziehen." },
      { name: "Trizeps-Dips", time: 30, description: "Nutze eine Bank oder Stuhl, senke die Arme langsam ab und drücke dich wieder hoch." }
  ];

  let workoutPlan = [];
  let timeLeft = totalMinutes * 60; // Umrechnung in Sekunden

  while (timeLeft > 0) {
      let exercise = exercises[Math.floor(Math.random() * exercises.length)];
      if (timeLeft - exercise.time >= 0) {
          workoutPlan.push({ 
              name: exercise.name, 
              time: exercise.time, 
              description: exercise.description 
          });
          timeLeft -= exercise.time;
      }
  }

  return workoutPlan;
}

// Workout laden und Dropdown aktualisieren
function loadWorkout() {
  document.getElementById("setup-screen").classList.add("hidden");
  document.getElementById("workout-screen").classList.remove("hidden");

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const workout = JSON.parse(localStorage.getItem("workout"));

  document.getElementById("user-info").innerText = `Alter: ${userInfo.age}, Gewicht: ${userInfo.weight} kg, Workout: ${userInfo.time} min`;

  const workoutDropdown = document.getElementById("workout-dropdown");
  workoutDropdown.innerHTML = `<option value="">-- Bitte ein Workout auswählen --</option>`;

  workout.forEach((ex, index) => {
      let option = document.createElement("option");
      option.value = index;
      option.innerText = `${ex.name} (${ex.time} Sek.)`;
      workoutDropdown.appendChild(option);
  });
}

// Übungsdetails anzeigen
function showExerciseDetails() {
  const workout = JSON.parse(localStorage.getItem("workout"));
  const selectedIndex = document.getElementById("workout-dropdown").value;

  if (selectedIndex !== "") {
      const exercise = workout[selectedIndex];

      document.getElementById("exercise-name").innerText = exercise.name;
      document.getElementById("exercise-description").innerText = exercise.description;
      document.getElementById("exercise-details").classList.remove("hidden");
  } else {
      document.getElementById("exercise-details").classList.add("hidden");
  }
}

// Timer starten und nach Ablauf die Übung entfernen
let timerInterval;
function startTimer() {
  const workout = JSON.parse(localStorage.getItem("workout"));
  const selectedIndex = document.getElementById("workout-dropdown").value;

  if (selectedIndex === "") {
      alert("Bitte eine Übung auswählen!");
      return;
  }

  const exercise = workout[selectedIndex];
  let timeLeft = exercise.time;

  document.getElementById("timer-task-name").innerText = exercise.name;
  document.getElementById("timer").classList.remove("hidden");

  timerInterval = setInterval(() => {
      document.getElementById("countdown").innerText = `${timeLeft}s`;
      if (timeLeft <= 0) {
          clearInterval(timerInterval);
          // Sound abspielen, wenn der Timer abläuft
          document.getElementById("end-sound").play();
          alert("Zeit abgelaufen!");
          document.getElementById("timer").classList.add("hidden");

          // Übung aus der Liste entfernen
          workout.splice(selectedIndex, 1);
          localStorage.setItem("workout", JSON.stringify(workout));
          loadWorkout(); // Dropdown aktualisieren

          // Falls keine Übung mehr vorhanden ist, wird eine Abschlussnachricht angezeigt
          if (workout.length === 0) {
              document.getElementById("exercise-details").innerHTML = "<p>Alle Aufgaben sind für heute abgeschlossen!</p>";
          }
      }
      timeLeft--;
  }, 1000);
}

// Timer stoppen
function stopTimer() {
  clearInterval(timerInterval);
  document.getElementById("timer").classList.add("hidden");
}

// App zurücksetzen
function resetApp() {
  localStorage.clear();
  location.reload();
}
