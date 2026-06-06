<?php

require_once "config.php";

function getWeatherData($city, $apiKey)
{
    $url =
        "https://api.openweathermap.org/data/2.5/weather?q="
        . urlencode($city)
        . "&appid="
        . $apiKey
        . "&units=imperial";

    $response = file_get_contents($url);

    if (!$response)
    {
        return null;
    }

    return json_decode($response, true);
}

function calculateWeatherScore($weather)
{
    $score = 0;

    switch ($weather)
    {
        case "Thunderstorm":
            $score = 30;
            break;

        case "Rain":
            $score = 15;
            break;

        case "Snow":
            $score = 20;
            break;

        case "Clouds":
            $score = 5;
            break;

        default:
            $score = 0;
    }

    return $score;
}

$results = [];

foreach ($cities as $city)
{
    $weatherData = getWeatherData($city, $weatherApiKey);

    if (!$weatherData)
    {
        continue;
    }

    $weatherType =
        $weatherData["weather"][0]["main"];

    $temperature =
        round($weatherData["main"]["temp"]);

    $weatherScore =
        calculateWeatherScore($weatherType);

    // Simulated APIs for now
    $flightDelays = rand(0, 150);
    $trafficIncidents = rand(0, 20);
    $earthquakes = rand(0, 3);

    $flightScore =
        min($flightDelays * 0.15, 25);

    $trafficScore =
        min($trafficIncidents * 1.5, 20);

    $earthquakeScore =
        $earthquakes * 8;

    $chaosScore =
        round(
            $weatherScore +
            $flightScore +
            $trafficScore +
            $earthquakeScore
        );

    $results[] = [
        "city" => $city,
        "weather" => $weatherType,
        "temp" => $temperature,
        "flights" => $flightDelays,
        "traffic" => $trafficIncidents,
        "earthquakes" => $earthquakes,
        "score" => $chaosScore
    ];
}

usort($results, function($a, $b)
{
    return $b["score"] <=> $a["score"];
});

$worstCity = $results[0];

function verdict($score)
{
    if ($score >= 90)
    {
        return "🚨 Absolute disaster.";
    }

    if ($score >= 70)
    {
        return "⚠️ Very rough day.";
    }

    if ($score >= 50)
    {
        return "😬 Not ideal.";
    }

    return "🙂 Mostly okay.";
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Someone Is Having The Worst Day</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<div class="container">

    <h1>🌪 Someone Is Having The Worst Day</h1>

    <div class="winner-card">

        <h2>Worst Day Award</h2>

        <h3><?php echo $worstCity["city"]; ?></h3>

        <div class="score">
            <?php echo $worstCity["score"]; ?>/100
        </div>

        <p><?php echo verdict($worstCity["score"]); ?></p>

        <ul>
            <li>Weather: <?php echo $worstCity["weather"]; ?></li>
            <li>Flight Delays: <?php echo $worstCity["flights"]; ?></li>
            <li>Traffic Incidents: <?php echo $worstCity["traffic"]; ?></li>
            <li>Earthquakes: <?php echo $worstCity["earthquakes"]; ?></li>
        </ul>

    </div>

    <h2>Chaos Rankings</h2>

    <table>

        <tr>
            <th>City</th>
            <th>Weather</th>
            <th>Score</th>
        </tr>

        <?php foreach($results as $city): ?>

        <tr>
            <td><?php echo $city["city"]; ?></td>
            <td><?php echo $city["weather"]; ?></td>
            <td><?php echo $city["score"]; ?></td>
        </tr>

        <?php endforeach; ?>

    </table>

</div>

</body>
</html>