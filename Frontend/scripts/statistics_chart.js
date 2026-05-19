let badWordsChart = null;

export function renderBadWordsChart(chartData, period) {
  const canvas = document.getElementById("badWordsChart");

  if (!canvas || !chartData) {
    return;
  }

  const labels = chartData.map(item => {
    const date = new Date(item.date_group);

    if (period === "week") {
        return date.toLocaleDateString("en-US", { weekday: "short" });
        }

    if (period === "all") {
        return date.getFullYear() + " - Week " + getWeekNumber(date);
}

        return "Week " + getWeekNumber(date);
        });

  const values = chartData.map(item => Number(item.bad_words));

  if (badWordsChart) {
    badWordsChart.destroy();
  }

  badWordsChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Bad words found",
        data: values,
        backgroundColor: "rgba(104, 135, 97, 0.75)",
        borderColor: "rgba(104, 135, 97, 1)",
        borderWidth: 1,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Bad words found"
          }
        },
        x: {
          title: {
            display: true,
            text: period === "week" ? "Weekdays" : "Weeks"
          }
        }
      }
    }
  });
}

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;

  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}