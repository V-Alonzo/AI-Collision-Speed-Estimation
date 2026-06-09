import React from "react";

//graficas
import {

    Chart as ChartJS, CategoryScale, LinearScale,
    BarElement, Title, Tooltip, Legend,
    ArcElement,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,

} from 'chart.js';

import { Bar } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import { Radar } from 'react-chartjs-2';
import { Bubble } from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';
import { PolarArea } from 'react-chartjs-2';

const BarChart = (props) => {

    const { data } = props
    ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Chart.js Bar Chart',
            },
        },
    };

    return (
        <Bar options={options} data={data} />
    )
}

export const PastelChart = (props) => {

    const { data } = props

    ChartJS.register(ArcElement, Tooltip, Legend);

    return (
        <Pie data={data} />
    )


}

export const RadarChart = (props) => {

    const { data } = props
    ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

    return (
        <Radar data={data} />
    )
}

export const LineChart = (props) => {

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Chart.js Line Chart',
            },
        },
    };


    const { data } = props
    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
    return (
        <Line options={options} data={data} />
    )


}

export const BubbleChart = (props) => {

    const { data } = props
    ChartJS.register(LinearScale, PointElement, Tooltip, Legend);
    const options = { scales: { y: { beginAtZero: true, }, }, };

    return (
        <Bubble options={options} data={data} />
    )


}

export const DoughnutChart = (props) => {

    const { data } = props
    ChartJS.register(ArcElement, Tooltip, Legend);

    return (
        <Doughnut data={data} />
    )


}

export const PolarAreaChart = (props) => {

    const { data } = props
    ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

    return (
        <PolarArea data={data} />
    )


}


export default BarChart;