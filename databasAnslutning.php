<?php
// Databasanslutningsuppgifter
$host = 'localhost'; // vanligtvis 'localhost'
$username = 'root';
$password = 'MariaDBroot123';
$database = 'kandidatdb';

// Skapa anslutning
$conn = new mysqli($host, $username, $password, $database);

// Kontrollera anslutning
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Hämta regler från databasen
$sql = "SELECT rubrikID, rubrikNamn FROM regler ORDER BY rubrikID ASC";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // Output varje rad
    while($row = $result->fetch_assoc()) {
        echo "<li><a href='?regel=" . $row["rubrikID"] . "'>" . $row["rubrikNamn"] . "</a></li>";
    }
} else {
    echo "Inga regler hittades.";
}
$conn->close();
?>
