import React, {  useState, useEffect, useRef } from "react";

/// Ant Design Charts -- graficas de ANTD
import { Line } from '@ant-design/plots';
import { Area } from '@ant-design/plots';
import { Column, G2 } from '@ant-design/plots';
import { Bar } from '@ant-design/plots';
import { Pie, measureTextWidth } from '@ant-design/plots';
import { DualAxes } from '@ant-design/plots';
import { Gauge } from '@ant-design/plots';
import { Liquid } from '@ant-design/plots';
import { Scatter } from '@ant-design/plots';
import { DecompositionTreeGraph } from '@ant-design/graphs';
import { FlowAnalysisGraph } from '@ant-design/graphs';
import { FundFlowGraph } from '@ant-design/graphs';
import { OrganizationGraph } from '@ant-design/graphs';
import { RadialGraph } from '@ant-design/graphs';
import { RadialTreeGraph } from '@ant-design/graphs';
import { WordCloud } from '@ant-design/plots';
import { Heatmap } from '@ant-design/plots';
import { Treemap } from '@ant-design/plots';
import { Radar } from '@ant-design/plots';
import { Rose } from '@ant-design/plots';
import { Chord } from '@ant-design/plots';
import { Sunburst } from '@ant-design/plots';
import { RadialBar } from '@ant-design/plots';
import { CirclePacking } from '@ant-design/plots';
import { Venn } from '@ant-design/plots';
import { Stock } from '@ant-design/plots';

/// Ant Design Charts -- graficas de ANTD
const DemoLineBasic = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/bmw-prod/1d565782-dde4-4bb6-8946-ea6a38ccf184.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      padding: 'auto',
      xField: 'Date',
      yField: 'scales',
      xAxis: {
        // type: 'timeCat',
        tickCount: 5,
      },
    };

    return <Line {...config} />;
  };

  export const DemoLineBasic2 = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/bmw-prod/1d565782-dde4-4bb6-8946-ea6a38ccf184.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      padding: 'auto',
      xField: 'Date',
      yField: 'scales',
      annotations: [
        // 低于中位数颜色变化
        {
          type: 'regionFilter',
          start: ['min', 'median'],
          end: ['max', '0'],
          color: '#F4664A',
        },
        {
          type: 'text',
          position: ['min', 'median'],
          content: '中位数',
          offsetY: -4,
          style: {
            textBaseline: 'bottom',
          },
        },
        {
          type: 'line',
          start: ['min', 'median'],
          end: ['max', 'median'],
          style: {
            stroke: '#F4664A',
            lineDash: [2, 2],
          },
        },
      ],
    };

    return <Line {...config} />;
  };

  export  const DemoLineMulti = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/bmw-prod/c48dbbb1-fccf-4a46-b68f-a3ddb4908b68.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      xField: 'date',
      yField: 'value',
      yAxis: {
        label: {
          // 数值格式化为千分位
          formatter: (v) => `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`),
        },
      },
      seriesField: 'type',
      color: ({ type }) => {
        return type === 'register' ? '#F4664A' : type === 'download' ? '#30BF78' : '#FAAD14';
      },
      lineStyle: ({ type }) => {
        if (type === 'register') {
          return {
            lineDash: [4, 4],
            opacity: 1,
          };
        }

        return {
          opacity: 0.5,
        };
      },
    };

    return <Line {...config} />;
  };

  export   const DemoLineStep = () => {
    const data = [
      {
        month: 'Jan',
        key: 'series1',
        value: 125,
      },
      {
        month: 'Jan',
        key: 'series2',
        value: 51,
      },
      {
        month: 'Feb',
        key: 'series1',
        value: 132,
      },
      {
        month: 'Feb',
        key: 'series2',
        value: 91,
      },
      {
        month: 'Mar',
        key: 'series1',
        value: 141,
      },
      {
        month: 'Mar',
        key: 'series2',
        value: 34,
      },
      {
        month: 'Apr',
        key: 'series1',
        value: 158,
      },
      {
        month: 'Apr',
        key: 'series2',
        value: 47,
      },
      {
        month: 'May',
        key: 'series1',
        value: 133,
      },
      {
        month: 'May',
        key: 'series2',
        value: 63,
      },
      {
        month: 'June',
        key: 'series1',
        value: 143,
      },
      {
        month: 'June',
        key: 'series2',
        value: 58,
      },
      {
        month: 'July',
        key: 'series1',
        value: 176,
      },
      {
        month: 'July',
        key: 'series2',
        value: 56,
      },
      {
        month: 'Aug',
        key: 'series1',
        value: 194,
      },
      {
        month: 'Aug',
        key: 'series2',
        value: 77,
      },
      {
        month: 'Sep',
        key: 'series1',
        value: 115,
      },
      {
        month: 'Sep',
        key: 'series2',
        value: 99,
      },
      {
        month: 'Oct',
        key: 'series1',
        value: 134,
      },
      {
        month: 'Oct',
        key: 'series2',
        value: 106,
      },
      {
        month: 'Nov',
        key: 'series1',
        value: 110,
      },
      {
        month: 'Nov',
        key: 'series2',
        value: 88,
      },
      {
        month: 'Dec',
        key: 'series1',
        value: 91,
      },
      {
        month: 'Dec',
        key: 'series2',
        value: 56,
      },
    ];
    const config = {
      data,
      xField: 'month',
      yField: 'value',
      legend: false,
      seriesField: 'key',
      stepType: 'hvh',
    };
    return <Line {...config} />;
  };

  export   const DemoAreaBasic = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/bmw-prod/360c3eae-0c73-46f0-a982-4746a6095010.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      xField: 'timePeriod',
      yField: 'value',
      xAxis: {
        range: [0, 1],
      },
    };

    return <Area {...config} />;
  };

  export  const DemoAreaStacked = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/bmw-prod/b21e7336-0b3e-486c-9070-612ede49284e.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      xField: 'date',
      yField: 'value',
      seriesField: 'country',
    };

    return <Area {...config} />;
  };

  export  const DemoAreaPercent = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/bmw-prod/67ef5751-b228-417c-810a-962f978af3e7.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      xField: 'year',
      yField: 'value',
      seriesField: 'country',
      color: ['#82d1de', '#cb302d', '#e3ca8c'],
      areaStyle: {
        fillOpacity: 0.7,
      },
      appendPadding: 10,
      isPercent: true,
      yAxis: {
        label: {
          formatter: (value) => {
            return value * 100;
          },
        },
      },
      pattern: {
        type: 'line',
      },
    };

    return <Area {...config} />;
  };

  export  const DemoColumnBasic = () => {
    const data = [
      {
        type: '1-3秒',
        value: 0.16,
      },
      {
        type: '4-10秒',
        value: 0.125,
      },
      {
        type: '11-30秒',
        value: 0.24,
      },
      {
        type: '31-60秒',
        value: 0.19,
      },
      {
        type: '1-3分',
        value: 0.22,
      },
      {
        type: '3-10分',
        value: 0.05,
      },
      {
        type: '10-30分',
        value: 0.01,
      },
      {
        type: '30+分',
        value: 0.015,
      },
    ];
    const paletteSemanticRed = '#F4664A';
    const brandColor = '#5B8FF9';
    const config = {
      data,
      xField: 'type',
      yField: 'value',
      seriesField: '',
      color: ({ type }) => {
        if (type === '10-30分' || type === '30+分') {
          return paletteSemanticRed;
        }

        return brandColor;
      },
      label: {
        content: (originData) => {
          const val = parseFloat(originData.value);

          if (val < 0.05) {
            return (val * 100).toFixed(1) + '%';
          }
        },
        offset: 10,
      },
      legend: false,
      xAxis: {
        label: {
          autoHide: true,
          autoRotate: false,
        },
      },
    };
    return <Column {...config} />;
  };

  export   const DemoColumnStacked = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antfincdn/8elHX%26irfq/stack-column-data.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      isStack: true,
      xField: 'year',
      yField: 'value',
      seriesField: 'type',
      label: {
        // 可手动配置 label 数据标签位置
        position: 'middle',
        // 'top', 'bottom', 'middle'
        // 可配置附加的布局方法
        layout: [
          // 柱形图数据标签位置自动调整
          {
            type: 'interval-adjust-position',
          }, // 数据标签防遮挡
          {
            type: 'interval-hide-overlap',
          }, // 数据标签文颜色自动调整
          {
            type: 'adjust-color',
          },
        ],
      },
    };

    return <Column {...config} />;
  };

  export  const DemoColumnGrouped = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antfincdn/PC3daFYjNw/column-data.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      xField: 'city',
      yField: 'value',
      seriesField: 'type',
      isGroup: true,
      columnStyle: {
        radius: [20, 20, 0, 0],
      },
    };

    return <Column {...config} />;
  };

  export  const DemoColumnPercent = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antfincdn/jSRiL%26YNql/percent-column.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    G2.registerInteraction('element-link', {
      start: [
        {
          trigger: 'interval:mouseenter',
          action: 'element-link-by-color:link',
        },
      ],
      end: [
        {
          trigger: 'interval:mouseleave',
          action: 'element-link-by-color:unlink',
        },
      ],
    });
    const config = {
      data,
      xField: 'year',
      yField: 'value',
      seriesField: 'type',
      isPercent: true,
      isStack: true,
      meta: {
        value: {
          min: 0,
          max: 1,
        },
      },
      label: {
        position: 'middle',
        content: (item) => {
          return `${(item.value * 100).toFixed(2)}%`;
        },
        style: {
          fill: '#fff',
        },
      },
      tooltip: false,
      interactions: [
        {
          type: 'element-highlight-by-color',
        },
        {
          type: 'element-link',
        },
      ],
    };

    return <Column {...config} />;
  };

  export  const DemoColumnRange = () => {
    const data = [
      {
        type: '分类一',
        values: [76, 100],
      },
      {
        type: '分类二',
        values: [56, 108],
      },
      {
        type: '分类三',
        values: [38, 129],
      },
      {
        type: '分类四',
        values: [58, 155],
      },
      {
        type: '分类五',
        values: [45, 120],
      },
      {
        type: '分类六',
        values: [23, 99],
      },
      {
        type: '分类七',
        values: [18, 56],
      },
      {
        type: '分类八',
        values: [18, 34],
      },
    ];
    const config = {
      data,
      xField: 'type',
      yField: 'values',
      isRange: true,
      label: {
        position: 'middle',
        layout: [
          {
            type: 'adjust-color',
          },
        ],
      },
    };
    return <Column {...config} />;
  };

  export const DemoBarBasic = () => {
    const data = [
      {
        year: '1951 年',
        value: 38,
      },
      {
        year: '1952 年',
        value: 52,
      },
      {
        year: '1956 年',
        value: 61,
      },
      {
        year: '1957 年',
        value: 145,
      },
      {
        year: '1958 年',
        value: 48,
      },
    ];
    const config = {
      data,
      xField: 'value',
      yField: 'year',
      seriesField: 'year',
      legend: {
        position: 'top-left',
      },
    };
    return <Bar {...config} />;
  };

  export  const DemoPieBasic = () => {
    const data = [
      {
        type: '分类一',
        value: 27,
      },
      {
        type: '分类二',
        value: 25,
      },
      {
        type: '分类三',
        value: 18,
      },
      {
        type: '分类四',
        value: 15,
      },
      {
        type: '分类五',
        value: 10,
      },
      {
        type: '其他',
        value: 5,
      },
    ];
    const config = {
      appendPadding: 10,
      data,
      angleField: 'value',
      colorField: 'type',
      radius: 0.9,
      label: {
        type: 'inner',
        offset: '-30%',
        content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
        style: {
          fontSize: 14,
          textAlign: 'center',
        },
      },
      interactions: [
        {
          type: 'element-active',
        },
      ],
    };
    return <Pie {...config} />;
  };

  export  const DemoPieBasic2 = () => {
    const G = G2.getEngine('canvas');
    const data = [
      {
        type: '分类一',
        value: 100,
      },
      {
        type: '分类二',
        value: 200,
      },
      {
        type: '分类三',
        value: 300,
      },
      {
        type: '分类四',
        value: 100,
      },
      {
        type: '分类五',
        value: 100,
      },
      {
        type: '其他',
        value: 200,
      },
    ];
    const cfg = {
      appendPadding: 10,
      data,
      angleField: 'value',
      colorField: 'type',
      radius: 0.75,
      legend: false,
      label: {
        type: 'spider',
        labelHeight: 40,
        formatter: (data, mappingData) => {
          const group = new G.Group({});
          group.addShape({
            type: 'circle',
            attrs: {
              x: 0,
              y: 0,
              width: 40,
              height: 50,
              r: 5,
              fill: mappingData.color,
            },
          });
          group.addShape({
            type: 'text',
            attrs: {
              x: 10,
              y: 8,
              text: `${data.type}`,
              fill: mappingData.color,
            },
          });
          group.addShape({
            type: 'text',
            attrs: {
              x: 0,
              y: 25,
              text: `${data.value}个 ${data.percent * 100}%`,
              fill: 'rgba(0, 0, 0, 0.65)',
              fontWeight: 700,
            },
          });
          return group;
        },
      },
      interactions: [
        {
          type: 'element-selected',
        },
        {
          type: 'element-active',
        },
      ],
    };
    const config = cfg;
    return <Pie {...config} />;
  };

  export  const DemoPieQuarter = () => {
    const data = [
      {
        type: '分类一',
        value: 27,
      },
      {
        type: '分类二',
        value: 25,
      },
      {
        type: '分类三',
        value: 18,
      },
      {
        type: '分类四',
        value: 15,
      },
      {
        type: '分类五',
        value: 10,
      },
      {
        type: '其他',
        value: 5,
      },
    ];
    const config = {
      appendPadding: 10,
      data,
      angleField: 'value',
      colorField: 'type',
      radius: 1,
      // 设置圆弧起始角度
      startAngle: Math.PI,
      endAngle: Math.PI * 1.5,
      label: {
        type: 'inner',
        offset: '-8%',
        content: '{name}',
        style: {
          fontSize: 18,
        },
      },
      interactions: [
        {
          type: 'element-active',
        },
      ],
      pieStyle: {
        lineWidth: 0,
      },
    };
    return <Pie {...config} />;
  };

  export   const DemoPieinteraction = () => {
    const data = [
      {
        type: '分类一',
        value: 27,
      },
      {
        type: '分类二',
        value: 25,
      },
      {
        type: '分类三',
        value: 18,
      },
      {
        type: '分类四',
        value: 15,
      },
      {
        type: '分类五',
        value: 10,
      },
      {
        type: '其他',
        value: 5,
      },
    ];
    const config = {
      appendPadding: 10,
      data,
      angleField: 'value',
      colorField: 'type',
      radius: 0.8,
      label: {
        type: 'outer',
        content: '{name} {percentage}',
      },
      interactions: [
        {
          type: 'pie-legend-active',
        },
        {
          type: 'element-active',
        },
      ],
    };
    return <Pie {...config} />;
  };


  export  const DemoPieDonut = () => {
    const data = [
      {
        type: '分类一',
        value: 27,
      },
      {
        type: '分类二',
        value: 25,
      },
      {
        type: '分类三',
        value: 18,
      },
      {
        type: '分类四',
        value: 15,
      },
      {
        type: '分类五',
        value: 10,
      },
      {
        type: '其他',
        value: 5,
      },
    ];
    const config = {
      appendPadding: 10,
      data,
      angleField: 'value',
      colorField: 'type',
      radius: 1,
      innerRadius: 0.6,
      label: {
        type: 'inner',
        offset: '-50%',
        content: '{value}',
        style: {
          textAlign: 'center',
          fontSize: 14,
        },
      },
      interactions: [
        {
          type: 'element-selected',
        },
        {
          type: 'element-active',
        },
      ],
      statistic: {
        title: false,
        content: {
          style: {
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
          content: 'AntV\nG2Plot',
        },
      },
    };
    return <Pie {...config} />;
  };


  export  const DemoPieDonutstatistics = () => {
    function renderStatistic(containerWidth, text, style) {
      const { width: textWidth, height: textHeight } = measureTextWidth(text, style);
      const R = containerWidth / 2; // r^2 = (w / 2)^2 + (h - offsetY)^2

      let scale = 1;

      if (containerWidth < textWidth) {
        scale = Math.min(Math.sqrt(Math.abs(Math.pow(R, 2) / (Math.pow(textWidth / 2, 2) + Math.pow(textHeight, 2)))), 1);
      }

      const textStyleStr = `width:${containerWidth}px;`;
      return `<div style="${textStyleStr};font-size:${scale}em;line-height:${scale < 1 ? 1 : 'inherit'};">${text}</div>`;
    }

    const data = [
      {
        type: '分类一',
        value: 27,
      },
      {
        type: '分类二',
        value: 25,
      },
      {
        type: '分类三',
        value: 18,
      },
      {
        type: '分类四',
        value: 15,
      },
      {
        type: '分类五',
        value: 10,
      },
      {
        type: '其他',
        value: 5,
      },
    ];
    const config = {
      appendPadding: 10,
      data,
      angleField: 'value',
      colorField: 'type',
      radius: 1,
      innerRadius: 0.64,
      meta: {
        value: {
          formatter: (v) => `${v} ¥`,
        },
      },
      label: {
        type: 'inner',
        offset: '-50%',
        style: {
          textAlign: 'center',
        },
        autoRotate: false,
        content: '{value}',
      },
      statistic: {
        title: {
          offsetY: -4,
          customHtml: (container, view, datum) => {
            const { width, height } = container.getBoundingClientRect();
            const d = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
            const text = datum ? datum.type : '总计';
            return renderStatistic(d, text, {
              fontSize: 28,
            });
          },
        },
        content: {
          offsetY: 4,
          style: {
            fontSize: '32px',
          },
          customHtml: (container, view, datum, data) => {
            const { width } = container.getBoundingClientRect();
            const text = datum ? `¥ ${datum.value}` : `¥ ${data.reduce((r, d) => r + d.value, 0)}`;
            return renderStatistic(width, text, {
              fontSize: 32,
            });
          },
        },
      },
      // 添加 中心统计文本 交互
      interactions: [
        {
          type: 'element-selected',
        },
        {
          type: 'element-active',
        },
        {
          type: 'pie-statistic-active',
        },
      ],
    };
    return <Pie {...config} />;
  };

  export  const DemoDualAxes = () => {
    const uvBillData = [
      {
        time: '2019-03',
        value: 350,
        type: 'uv',
      },
      {
        time: '2019-04',
        value: 900,
        type: 'uv',
      },
      {
        time: '2019-05',
        value: 300,
        type: 'uv',
      },
      {
        time: '2019-06',
        value: 450,
        type: 'uv',
      },
      {
        time: '2019-07',
        value: 470,
        type: 'uv',
      },
      {
        time: '2019-03',
        value: 220,
        type: 'bill',
      },
      {
        time: '2019-04',
        value: 300,
        type: 'bill',
      },
      {
        time: '2019-05',
        value: 250,
        type: 'bill',
      },
      {
        time: '2019-06',
        value: 220,
        type: 'bill',
      },
      {
        time: '2019-07',
        value: 362,
        type: 'bill',
      },
    ];
    const transformData = [
      {
        time: '2019-03',
        count: 800,
        name: 'a',
      },
      {
        time: '2019-04',
        count: 600,
        name: 'a',
      },
      {
        time: '2019-05',
        count: 400,
        name: 'a',
      },
      {
        time: '2019-06',
        count: 380,
        name: 'a',
      },
      {
        time: '2019-07',
        count: 220,
        name: 'a',
      },
      {
        time: '2019-03',
        count: 750,
        name: 'b',
      },
      {
        time: '2019-04',
        count: 650,
        name: 'b',
      },
      {
        time: '2019-05',
        count: 450,
        name: 'b',
      },
      {
        time: '2019-06',
        count: 400,
        name: 'b',
      },
      {
        time: '2019-07',
        count: 320,
        name: 'b',
      },
      {
        time: '2019-03',
        count: 900,
        name: 'c',
      },
      {
        time: '2019-04',
        count: 600,
        name: 'c',
      },
      {
        time: '2019-05',
        count: 450,
        name: 'c',
      },
      {
        time: '2019-06',
        count: 300,
        name: 'c',
      },
      {
        time: '2019-07',
        count: 200,
        name: 'c',
      },
    ];
    const config = {
      data: [uvBillData, transformData],
      xField: 'time',
      yField: ['value', 'count'],
      geometryOptions: [
        {
          geometry: 'line',
          seriesField: 'type',
          lineStyle: {
            lineWidth: 3,
            lineDash: [5, 5],
          },
          smooth: true,
        },
        {
          geometry: 'line',
          seriesField: 'name',
          point: {},
        },
      ],
    };
    return <DualAxes {...config} />;
  };

  export  const DemoGauge = () => {
    const config = {
      percent: 0.75,
      type: 'meter',
      innerRadius: 0.75,
      range: {
        ticks: [0, 1 / 3, 2 / 3, 1],
        color: ['#F4664A', '#FAAD14', '#30BF78'],
      },
      indicator: {
        pointer: {
          style: {
            stroke: '#D0D0D0',
          },
        },
        pin: {
          style: {
            stroke: '#D0D0D0',
          },
        },
      },
      statistic: {
        content: {
          style: {
            fontSize: '36px',
            lineHeight: '36px',
          },
        },
      },
    };
    return <Gauge {...config} />;
  };

  export  const DemoLiquid = () => {
    const config = {
      percent: 0.65,
      shape: 'diamond',
      outline: {
        border: 4,
        distance: 8,
      },
      wave: {
        length: 128,
      },
      pattern: {
        type: 'line',
      },
    };
    return <Liquid {...config} />;
  };

  export   const DemoLiquidStart = () => {
    const config = {
      percent: 0.25,
      shape: (x, y, width, height) => {
        const path = [];
        const w = Math.min(width, height);

        for (let i = 0; i < 5; i++) {
          path.push([
            i === 0 ? 'M' : 'L',
            (Math.cos(((18 + i * 72) * Math.PI) / 180) * w) / 2 + x,
            (-Math.sin(((18 + i * 72) * Math.PI) / 180) * w) / 2 + y,
          ]);
          path.push([
            'L',
            (Math.cos(((54 + i * 72) * Math.PI) / 180) * w) / 4 + x,
            (-Math.sin(((54 + i * 72) * Math.PI) / 180) * w) / 4 + y,
          ]);
        }

        path.push(['Z']);
        return path;
      },
      outline: {
        border: 2,
        distance: 4,
        style: {
          stroke: '#FFC100',
          strokeOpacity: 0.65,
        },
      },
      wave: {
        length: 128,
      },
      theme: {
        styleSheet: {
          brandColor: '#FAAD14',
        },
      },
    };
    return <Liquid {...config} />;
  };

  export   const DemoLiquidHeart = () => {
    const config = {
      percent: 0.25,
      shape: function (x, y, width, height) {
        const r = width / 4;
        const dx = x - width / 2;
        const dy = y - height / 2;
        return [
          ['M', dx, dy + r * 2],
          ['A', r, r, 0, 0, 1, x, dy + r],
          ['A', r, r, 0, 0, 1, dx + width, dy + r * 2],
          ['L', x, dy + height],
          ['L', dx, dy + r * 2],
          ['Z'],
        ];
      },
      outline: {
        border: 4,
        distance: 8,
      },
      wave: {
        length: 128,
      },
    };
    return <Liquid {...config} />;
  };

  export  const DemoScattermapping = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antfincdn/aao6XnO5pW/IMDB.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      appendPadding: 10,
      data,
      xField: 'Revenue (Millions)',
      yField: 'Rating',
      shape: 'circle',
      colorField: 'Genre',
      size: 4,
      yAxis: {
        nice: true,
        line: {
          style: {
            stroke: '#aaa',
          },
        },
      },
      xAxis: {
        min: -100,
        grid: {
          line: {
            style: {
              stroke: '#eee',
            },
          },
        },
        line: {
          style: {
            stroke: '#aaa',
          },
        },
      },
    };

    return <Scatter {...config} />;
  };

  export  const DemoScatterregression = () => {
    const data = [
      { x: 1, y: 4.181 },
      { x: 2, y: 4.665 },
      { x: 3, y: 5.296 },
      { x: 4, y: 5.365 },
      { x: 5, y: 5.448 },
      { x: 6, y: 5.744 },
      { x: 7, y: 5.653 },
      { x: 8, y: 5.844 },
      { x: 9, y: 6.362 },
      { x: 10, y: 6.38 },
      { x: 11, y: 6.311 },
      { x: 12, y: 6.457 },
      { x: 13, y: 6.479 },
      { x: 14, y: 6.59 },
      { x: 15, y: 6.74 },
      { x: 16, y: 6.58 },
      { x: 17, y: 6.852 },
      { x: 18, y: 6.531 },
      { x: 19, y: 6.682 },
      { x: 20, y: 7.013 },
      { x: 21, y: 6.82 },
      { x: 22, y: 6.647 },
      { x: 23, y: 6.951 },
      { x: 24, y: 7.121 },
      { x: 25, y: 7.143 },
      { x: 26, y: 6.914 },
      { x: 27, y: 6.941 },
      { x: 28, y: 7.226 },
      { x: 29, y: 6.898 },
      { x: 30, y: 7.392 },
      { x: 31, y: 6.938 },
    ];
    const config = {
      data,
      xField: 'x',
      yField: 'y',
      size: 5,
      pointStyle: {
        stroke: '#777777',
        lineWidth: 1,
        fill: '#5B8FF9',
      },
      regressionLine: {
        type: 'quad', // linear, exp, loess, log, poly, pow, quad
      },
    };

    return <Scatter {...config} />;
  };

  export  const DemoScatterBubblequadrant = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/bmw-prod/0b37279d-1674-42b4-b285-29683747ad9a.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      appendPadding: 30,
      data,
      xField: 'change in female rate',
      yField: 'change in male rate',
      sizeField: 'pop',
      colorField: 'continent',
      color: ['#ffd500', '#82cab2', '#193442', '#d18768', '#7e827a'],
      size: [4, 30],
      shape: 'circle',
      pointStyle: {
        fillOpacity: 0.8,
        stroke: '#bbb',
      },
      xAxis: {
        min: -25,
        max: 5,
        grid: {
          line: {
            style: {
              stroke: '#eee',
            },
          },
        },
        line: {
          style: {
            stroke: '#aaa',
          },
        },
      },
      yAxis: {
        line: {
          style: {
            stroke: '#aaa',
          },
        },
      },
      quadrant: {
        xBaseline: 0,
        yBaseline: 0,
        labels: [
          {
            content: 'Male decrease,\nfemale increase',
          },
          {
            content: 'Female decrease,\nmale increase',
          },
          {
            content: 'Female & male decrease',
          },
          {
            content: 'Female &\n male increase',
          },
        ],
      },
    };

    return <Scatter {...config} />;
  };

  export   const DemoDecompositionTreeGraphBasic = () => {
    const data = {
      id: 'A0',
      value: {
        title: '订单金额',
        items: [
          {
            text: '3031万',
          },
        ],
      },
      children: [
        {
          id: 'A1',
          value: {
            title: '华南',
            items: [
              {
                text: '1152万',
              },
              {
                text: '占比',
                value: '30%',
              },
            ],
          },
          children: [
            {
              id: 'A11',
              value: {
                title: '广东',
                items: [
                  {
                    text: '1152万',
                  },
                  {
                    text: '占比',
                    value: '30%',
                  },
                ],
              },
            },
            {
              id: 'A12',
              value: {
                title: '广西',
                items: [
                  {
                    text: '1152万',
                  },
                  {
                    text: '占比',
                    value: '30%',
                  },
                ],
              },
            },
            {
              id: 'A13',
              value: {
                title: '海南',
                items: [
                  {
                    text: '1152万',
                  },
                  {
                    text: '占比',
                    value: '30%',
                  },
                ],
              },
            },
          ],
        },
        {
          id: 'A2',
          value: {
            title: '华北',
            items: [
              {
                text: '595万',
              },
              {
                text: '占比',
                value: '30%',
                icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
              },
            ],
          },
        },
      ],
    };

    const config = {
      data,
      markerCfg: (cfg) => {
        const { children } = cfg;
        return {
          show: children?.length,
        };
      },
      behaviors: ['drag-canvas', 'zoom-canvas', 'drag-node'],
    };

    return <DecompositionTreeGraph {...config} />;
  };

  export   const DemoDecompositionTreeGraphstroke = () => {
    const data = {
      id: 'A0',
      value: {
        title: '订单金额',
        items: [
          {
            text: '3031万',
          },
        ],
      },
      children: [
        {
          id: 'A1',
          value: {
            title: '华南',
            items: [
              {
                text: '1152万',
              },
              {
                text: '占比',
                value: '30%',
              },
            ],
          },
          children: [
            {
              id: 'A11',
              value: {
                title: '广东',
                items: [
                  {
                    text: '1152万',
                  },
                  {
                    text: '占比',
                    value: '30%',
                  },
                ],
              },
            },
            {
              id: 'A12',
              value: {
                title: '广西',
                items: [
                  {
                    text: '1152万',
                  },
                  {
                    text: '占比',
                    value: '30%',
                  },
                ],
              },
            },
            {
              id: 'A13',
              value: {
                title: '海南',
                items: [
                  {
                    text: '1152万',
                  },
                  {
                    text: '占比',
                    value: '30%',
                  },
                ],
              },
            },
          ],
        },
        {
          id: 'A2',
          value: {
            title: '华北',
            items: [
              {
                text: '595万',
              },
              {
                text: '占比',
                value: '30%',
                icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
              },
            ],
          },
        },
      ],
    };
    const config = {
      data,
      behaviors: ['drag-canvas', 'zoom-canvas', 'drag-node'],
      nodeCfg: {
        title: {
          containerStyle: {
            fill: 'transparent',
          },
          style: {
            fill: '#000',
          },
        },
        items: {
          containerStyle: {
            fill: '#fff',
          },
          style: (cfg, group, type) => {
            const styles = {
              icon: {
                width: 10,
                height: 10,
              },
              value: {
                fill: '#52c41a',
              },
              text: {
                fill: '#aaa',
              },
            };
            return styles[type];
          },
        },
        style: {
          stroke: 'transparent',
        },
        nodeStateStyles: false,
      },
      edgeCfg: {
        endArrow: {
          show: false,
        },
        style: (item, graph) => {
          /**
           * graph.findById(item.target).getModel()
           * item.source: 获取 source 数据
           * item.target: 获取 target 数据
           */
          // console.log(graph.findById(item.source).getModel());
          return {
            stroke: '#40a9ff',
            lineWidth: Math.random() * 10 + 1,
            strokeOpacity: 0.5,
          };
        },
        edgeStateStyles: false,
      },
    };
    // @ts-ignore
    return <DecompositionTreeGraph {...config} />;
  };

  export  const DemoFlowAnalysisGraphBasic = () => {
    const data = {
      nodes: [
        {
          id: '-3',
          value: {
            title: '来源页面A',
            items: [
              {
                text: '曝光PV',
                value: '10.30万',
                icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
              },
            ],
          },
        },
        {
          id: '-2',
          value: {
            title: '来源页面B',
            items: [
              {
                text: '点击UV',
                value: '10.30万',
                icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
              },
            ],
          },
        },
        {
          id: '-1',
          value: {
            title: '来源页面C',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
        {
          id: '0',
          value: {
            title: '活动页面',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
        {
          id: '1',
          value: {
            title: '去向页面A',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
        {
          id: '2',
          value: {
            title: '去向页面B',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
        {
          id: '3',
          value: {
            title: '去向页面C',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
        {
          id: '4',
          value: {
            title: '去向页面D',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
        {
          id: '5',
          value: {
            title: '去向页面E',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
        {
          id: '6',
          value: {
            title: '去向页面F',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
        {
          id: '6',
          value: {
            title: '去向页面F',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
        {
          id: '7',
          value: {
            title: '去向页面G',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
        {
          id: '8',
          value: {
            title: '去向页面H',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
      ],
      edges: [
        {
          source: '-3',
          target: '0',
          value: '来源A',
        },
        {
          source: '-2',
          target: '0',
          value: '来源B',
        },
        {
          source: '-1',
          target: '0',
          value: '来源C',
        },
        {
          source: '0',
          target: '1',
        },
        {
          source: '0',
          target: '2',
        },
        {
          source: '0',
          target: '3',
        },
        {
          source: '0',
          target: '4',
        },
        {
          source: '0',
          target: '5',
        },
        {
          source: '2',
          target: '6',
        },
        {
          source: '3',
          target: '7',
        },
        {
          source: '4',
          target: '8',
        },
      ],
    };
    const config = {
      data,
      nodeCfg: {
        size: [140, 25],
        items: {
          containerStyle: {
            fill: '#fff',
          },
          padding: 6,
          style: (cfg, group, type) => {
            const styles = {
              icon: {
                width: 12,
                height: 12,
              },
              value: {
                fill: '#f00',
              },
              text: {
                fill: '#aaa',
              },
            };
            return styles[type];
          },
        },
        nodeStateStyles: {
          hover: {
            stroke: '#1890ff',
            lineWidth: 2,
          },
        },
        title: {
          containerStyle: {
            fill: 'transparent',
          },
          style: {
            fill: '#000',
            fontSize: 12,
          },
        },
        style: {
          fill: '#E6EAF1',
          stroke: '#B2BED5',
          radius: [2, 2, 2, 2],
        },
      },
      edgeCfg: {
        label: {
          style: {
            fill: '#aaa',
            fontSize: 12,
            fillOpacity: 1,
          },
        },
        style: (edge) => {
          const stroke = edge.target === '0' ? '#c86bdd' : '#5ae859';
          return {
            stroke,
            lineWidth: Math.random() * 10 + 1,
            strokeOpacity: 0.5,
          };
        },
        edgeStateStyles: {
          hover: {
            strokeOpacity: 1,
          },
        },
      },
      markerCfg: (cfg) => {
        const { edges } = data;
        return {
          position: 'right',
          show: edges.find((item) => item.source === cfg.id),
          collapsed: !edges.find((item) => item.source === cfg.id),
        };
      },
      behaviors: ['drag-canvas', 'zoom-canvas', 'drag-node'],
    };

    return <FlowAnalysisGraph {...config} />;
  };

  export  const DemoFlowAnalysisGraphLayout = () => {
    const data = {
      nodes: [
        {
          id: '-3',
          value: {
            title: '来源页面A',
            items: [
              {
                text: '曝光PV',
                value: '10.30万',
                icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
              },
            ],
          },
        },
        {
          id: '-2',
          value: {
            title: '来源页面B',
            items: [
              {
                text: '点击UV',
                value: '10.30万',
                icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
              },
            ],
          },
        },
        {
          id: '-1',
          value: {
            title: '来源页面C',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
        {
          id: '0',
          value: {
            title: '活动页面',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
        {
          id: '1',
          value: {
            title: '去向页面A',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
        {
          id: '2',
          value: {
            title: '去向页面B',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
        {
          id: '3',
          value: {
            title: '去向页面C',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
        {
          id: '4',
          value: {
            title: '去向页面D',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
        {
          id: '5',
          value: {
            title: '去向页面E',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
        {
          id: '6',
          value: {
            title: '去向页面F',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
        {
          id: '6',
          value: {
            title: '去向页面F',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
        {
          id: '7',
          value: {
            title: '去向页面G',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
        {
          id: '8',
          value: {
            title: '去向页面H',
            items: [
              {
                text: '访问页面UV',
              },
            ],
          },
        },
      ],
      edges: [
        {
          source: '-3',
          target: '0',
          value: '来源A',
        },
        {
          source: '-2',
          target: '0',
          value: '来源B',
        },
        {
          source: '-1',
          target: '0',
          value: '来源C',
        },
        {
          source: '0',
          target: '1',
        },
        {
          source: '0',
          target: '2',
        },
        {
          source: '0',
          target: '3',
        },
        {
          source: '0',
          target: '4',
        },
        {
          source: '0',
          target: '5',
        },
        {
          source: '2',
          target: '6',
        },
        {
          source: '3',
          target: '7',
        },
        {
          source: '4',
          target: '8',
        },
      ],
    };
    const config = {
      data,
      layout: {
        rankdir: 'TB',
        ranksepFunc: () => 20,
      },
      nodeCfg: {
        anchorPoints: [
          [0.5, 0],
          [0.5, 1],
        ],
      },
      edgeCfg: {
        type: 'polyline',
        endArrow: true,
      },
      markerCfg: (cfg) => {
        return {
          position: 'bottom',
          show: data.edges.filter((item) => item.source === cfg.id)?.length,
        };
      },
      behaviors: ['drag-canvas', 'zoom-canvas', 'drag-node'],
    };

    return <FlowAnalysisGraph {...config} />;
  };

  export const DemoFundFlowGraph = () => {
    const data = {
      nodes: [
        {
          id: '1',
          value: {
            text: 'Company1',
            // 建议使用 bae64 数据
            icon: 'https://gw.alipayobjects.com/zos/antfincdn/28B4PgocL4/bbd3e7ef-6b5e-4034-893d-1b5073ad9aa4.png',
          },
        },
        {
          id: '2',
          value: { text: 'Company2' },
        },
        {
          id: '3',
          value: { text: 'Company3' },
        },
        {
          id: '4',
          value: { text: 'Company4' },
        },
        {
          id: '5',
          value: { text: 'Company5' },
        },
        {
          id: '6',
          value: { text: 'Company6' },
        },
        {
          id: '7',
          value: { text: 'Company7' },
        },
        {
          id: '8',
          value: { text: 'Company8' },
        },
        {
          id: '9',
          value: { text: 'Company9' },
        },
      ],
      edges: [
        {
          source: '1',
          target: '2',
          value: { text: '100,000 Yuan', subText: '2019-08-03', extraKey: 'A' },
        },
        {
          source: '1',
          target: '3',
          value: { text: '100,000 Yuan', subText: '2019-08-03', extraKey: 'B' },
        },
        {
          source: '2',
          target: '5',
          value: { text: '100,000 Yuan', subText: '2019-08-03' },
        },
        {
          source: '5',
          target: '6',
          value: { text: '100,000 Yuan', subText: '2019-08-03' },
        },
        {
          source: '3',
          target: '4',
          value: { text: '100,000 Yuan', subText: '2019-08-03' },
        },
        {
          source: '4',
          target: '7',
          value: { text: '100,000 Yuan', subText: '2019-08-03' },
        },
        {
          source: '1',
          target: '8',
          value: { text: '100,000 Yuan', subText: '2019-08-03' },
        },
        {
          source: '1',
          target: '9',
          value: { text: '100,000 Yuan', subText: '2019-08-03' },
        },
      ],
    };
    const colorMap = {
      A: '#FFAA15',
      B: '#72CC4A',
    };
    const config = {
      data,
      edgeCfg: {
        // type: 'line',
        endArrow: (edge) => {
          const { value } = edge;
          return {
            fill: colorMap[value.extraKey] || '#40a9ff',
          };
        },
        style: (edge) => {
          const { value } = edge;
          return {
            stroke: colorMap[value.extraKey] || '#40a9ff',
          };
        },
        edgeStateStyles: {
          hover: {
            stroke: '#1890ff',
            lineWidth: 2,
            endArrow: {
              fill: '#1890ff',
            },
          },
        },
      },
      markerCfg: (cfg) => {
        const { edges } = data;
        return {
          position: 'right',
          show: edges.find((item) => item.source === cfg.id),
          collapsed: !edges.find((item) => item.source === cfg.id),
        };
      },
    };

    return <FundFlowGraph {...config} />;
  };

  export  const DemoOrganizationGraphBasic = () => {
    const data = {
      id: 'root',
      value: {
        name: '股东会',
      },
      children: [
        {
          id: 'joel',
          value: {
            name: 'Joel Alan',
          },
          children: [
            {
              id: 'c1',
              value: {
                name: 'c1',
              },
              children: [
                {
                  id: 'c1-1',
                  value: {
                    name: 'c1-1',
                  },
                },
                {
                  id: 'c1-2',
                  value: {
                    name: 'c1-2',
                  },
                  children: [
                    {
                      id: 'c1-2-1',
                      value: {
                        name: 'c1-2-1',
                      },
                    },
                    {
                      id: 'c1-2-2',
                      value: {
                        name: 'c1-2-2',
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: 'c2',
              value: {
                name: 'c2',
              },
            },
            {
              id: 'c3',
              value: {
                name: 'c3',
              },
              children: [
                {
                  id: 'c3-1',
                  value: {
                    name: 'c3-1',
                  },
                },
                {
                  id: 'c3-2',
                  value: {
                    name: 'c3-2',
                  },
                  children: [
                    {
                      id: 'c3-2-1',
                      value: {
                        name: 'c3-2-1',
                      },
                    },
                    {
                      id: 'c3-2-2',
                      value: {
                        name: 'c3-2-2',
                      },
                    },
                    {
                      id: 'c3-2-3',
                      value: {
                        name: 'c3-2-3',
                      },
                    },
                  ],
                },
                {
                  id: 'c3-3',
                  value: {
                    name: 'c3-3',
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    return <OrganizationGraph data={data} behaviors={['drag-canvas', 'zoom-canvas', 'drag-node']} />;
  };

  export  const DemoOrganizationGraphStyle = () => {
    const data = {
      id: 'joel',
      value: {
        name: 'Joel Alan',
        title: 'CEO',
        // 建议使用 bae64 数据
        icon: 'https://avatars.githubusercontent.com/u/31396322?v=4',
      },
      children: [
        {
          id: 'c1',
          value: {
            name: 'c1',
            title: 'CTO',
          },
          children: [
            {
              id: 'c1-1',
              value: {
                name: 'c1-1',
              },
            },
            {
              id: 'c1-2',
              value: {
                name: 'c1-2',
              },
              children: [
                {
                  id: 'c1-2-1',
                  value: {
                    name: 'c1-2-1',
                  },
                },
                {
                  id: 'c1-2-2',
                  value: {
                    name: 'c1-2-2',
                  },
                },
              ],
            },
          ],
        },
        {
          id: 'c2',
          value: {
            name: 'c2',
            title: 'COO',
          },
        },
        {
          id: 'c3',
          value: {
            name: 'c3',
            title: 'CFO',
          },
          children: [
            {
              id: 'c3-1',
              value: {
                name: 'c3-1',
              },
            },
            {
              id: 'c3-2',
              value: {
                name: 'c3-2',
              },
              children: [
                {
                  id: 'c3-2-1',
                  value: {
                    name: 'c3-2-1',
                  },
                },
                {
                  id: 'c3-2-2',
                  value: {
                    name: 'c3-2-2',
                  },
                },
                {
                  id: 'c3-2-3',
                  value: {
                    name: 'c3-2-3',
                  },
                },
              ],
            },
            {
              id: 'c3-3',
              value: {
                name: 'c3-3',
              },
            },
          ],
        },
      ],
    };

    return (
      <OrganizationGraph
        data={data}
        nodeCfg={{
          style: (node) => {
            return node.id === 'joel'
              ? {
                fill: '#91d5ff',
                stroke: '#91d5ff',
              }
              : {};
          },
          label: {
            style: (node, group, type) => {
              const styles = {
                icon: {
                  width: 32,
                  height: 32,
                },
                title: {
                  fill: '#fff',
                },
                name: {
                  fill: '#fff',
                },
              };
              return node.id === 'joel' ? styles[type] : {};
            },
          },
        }}
      />
    );
  };

  export   const DemoOrganizationGraphCustom = () => {
    const data = {
      id: 'root',
      value: {
        name: '赵某某',
      },
      children: [
        {
          id: 'jug',
          value: {
            name: '审判长',
            level: 2,
          },
          children: [
            {
              id: 'joel',
              value: {
                name: '一审',
                level: 1,
              },
              children: [
                {
                  id: 'c1',
                  value: {
                    name: '原告',
                    level: 2,
                  },
                  children: [
                    {
                      id: 'c1-1',
                      value: {
                        name: '中纺原料xx有限公司',
                      },
                      children: [
                        {
                          id: 'c1-1-1',
                          value: {
                            name: '法定代表人',
                          },
                          children: [
                            {
                              id: 'c1-1-1-1',
                              value: {
                                name: '刘某某',
                              },
                            },
                          ],
                        },
                      ],
                    },
                    {
                      id: 'c1-2',
                      value: {
                        name: '委托诉讼代理人',
                      },
                      children: [
                        {
                          id: 'c1-2-1',
                          value: {
                            name: '北京xx律师事务所',
                          },
                        },
                        {
                          id: 'c1-2-2',
                          value: {
                            name: '赵某某',
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'c2',
                  value: {
                    name: '被告1',
                    level: 2,
                  },
                  children: [
                    {
                      id: 'c2-1',
                      value: {
                        name: '北京西郊xxxx农副产品批发市场有限公司',
                      },
                      children: [
                        {
                          id: 'c2-1-1',
                          value: {
                            name: '法定代表人',
                          },
                          children: [
                            {
                              id: 'c2-1-1-1',
                              value: {
                                name: '李某某',
                              },
                            },
                          ],
                        },
                      ],
                    },
                    {
                      id: 'c2-2',
                      value: {
                        name: '委托诉讼代理人',
                      },
                      children: [
                        {
                          id: 'c2-2-1',
                          value: {
                            name: '北京xx律师事务所',
                          },
                        },
                        {
                          id: 'c2-2-2',
                          value: {
                            name: '张某某',
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'c3',
                  value: {
                    name: '被告2',
                    level: 2,
                  },
                  children: [
                    {
                      id: 'c3-1',
                      value: {
                        name: '徐某某',
                      },
                    },
                    {
                      id: 'c3-2',
                      value: {
                        name: '委托诉讼代理人',
                      },
                      children: [
                        {
                          id: 'c3-2-1',
                          value: {
                            name: '北京xx律师事务所',
                          },
                        },
                        {
                          id: 'c3-2-2',
                          value: {
                            name: '张某某',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    const getTextStyle = (level) => {
      switch (level) {
        case 1:
          return 18;
        case 2:
          return 12;
        default:
          return 12;
      }
    };

    const getRootTextAttrs = () => {
      return {
        fontSize: getTextStyle(1),
        fontWeight: 'bold',
        fill: '#fff',
      };
    };

    const getSecondTextStyle = () => {
      return {
        fontSize: getTextStyle(2),
        color: '#000',
      };
    };

    const getRootNodeStyle = () => {
      return {
        fill: '#1E88E5',
        stroke: '#1E88E5',
        radius: 5,
      };
    };

    const getSecondNodeStyle = () => {
      return {
        fill: '#e8e8e8',
        stroke: '#e8e8e8',
        radius: 5,
      };
    };

    const calcStrLen = function calcStrLen(str) {
      var len = 0;
      for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 0 && str.charCodeAt(i) < 128) {
          len++;
        } else {
          len += 2;
        }
      }
      return len;
    };

    const config = {
      nodeCfg: {
        size: [40, 40],
        autoWidth: true,
        padding: 10,
        style: (item) => {
          const { level } = item.value;
          return {
            fill: 'transparent',
            stroke: 'transparent',
            radius: 4,
            cursor: 'pointer',
            ...(level === 1 ? getRootNodeStyle() : {}),
            ...(level === 2 ? getSecondNodeStyle() : {}),
          };
        },
        nodeStateStyles: {
          hover: {
            lineWidth: 2,
            stroke: '#96DEFF',
          },
        },
        label: {
          style: (cfg, group, type) => {
            const { level, href } = cfg.value;

            if (type !== 'name') {
              return {};
            }
            return {
              fontSize: getTextStyle(),
              cursor: 'pointer',
              fill: href ? '#1890ff' : '#000',
              ...(level === 1 ? getRootTextAttrs() : {}),
              ...(level === 2 ? getSecondTextStyle() : {}),
            };
          },
        },
        anchorPoints: [
          [0, 0.5],
          [1, 0.5],
        ],
      },
      edgeCfg: {
        type: 'polyline',
        style: {
          stroke: '#000',
          endArrow: false,
        },
      },
      markerCfg: (cfg) => {
        const { level, direction } = cfg.value;
        const show = level !== 1 && cfg.children && cfg.children.length > 0;
        return {
          position: direction,
          show,
        };
      },
      layout: {
        type: 'mindmap',
        direction: 'H',
        getWidth: (cfg) => {
          const { name, level } = cfg.value;
          const fontSize = getTextStyle(level);
          const width = (fontSize * calcStrLen(name)) / 2;
          return width;
        },
        getHeight: () => {
          return 25;
        },
        getVGap: () => {
          return 20;
        },
        getHGap: () => {
          return 40;
        },
        getSide: (d) => {
          return d.data.value.direction === 'left' ? 'left' : 'right';
        },
      },
      autoFit: true,
      fitCenter: true,
      animate: false,
      behaviors: ['drag-canvas', 'zoom-canvas'],
      onReady: (graph) => {
        graph.on('node:click', (evt) => {
          const { item, target } = evt;
          const { value } = item.get('model');
          if (value.href) {
            window.open(value.href);
          }
        });
      },
    };
    return <OrganizationGraph {...config} data={data} />;
  };

  export  const DemoRadialGraph = () => {
    const chartRef = useRef();
    const RadialData = {
      nodes: [
        {
          id: '0',
          label: '0',
        },
        {
          id: '1',
          label: '1',
        },
        {
          id: '2',
          label: '2',
        },
        {
          id: '3',
          label: '3',
        },
        {
          id: '4',
          label: '4',
        },
        {
          id: '5',
          label: '5',
        },
        {
          id: '6',
          label: '6',
        },
        {
          id: '7',
          label: '7',
        },
        {
          id: '8',
          label: '8',
        },
        {
          id: '9',
          label: '9',
        },
      ],
      edges: [
        {
          source: '0',
          target: '1',
        },
        {
          source: '0',
          target: '2',
        },
        {
          source: '0',
          target: '3',
        },
        {
          source: '0',
          target: '4',
        },
        {
          source: '0',
          target: '5',
        },
        {
          source: '0',
          target: '6',
        },
        {
          source: '0',
          target: '7',
        },
        {
          source: '0',
          target: '8',
        },
        {
          source: '0',
          target: '9',
        },
      ],
    };

    const fetchData = (node) => {
      return new Promise((resolve, reject) => {
        const data = new Array(Math.ceil(Math.random() * 10) + 2).fill('').map((_, i) => i + 1);
        setTimeout(() => {
          resolve({
            nodes: [
              {
                ...node,
              },
            ].concat(
              data.map((i) => {
                return {
                  id: `${node.id}-${i}`,
                  label: `${node.label}-${i}`,
                };
              }),
            ),
            edges: data.map((i) => {
              return {
                source: node.id,
                target: `${node.id}-${i}`,
              };
            }),
          });
        }, 1000);
      });
    };

    const asyncData = async (node) => {
      return await fetchData(node);
    };

    const config = {
      data: RadialData,
      autoFit: false,
      layout: {
        unitRadius: 80,
        /** 节点直径 */
        nodeSize: 20,
        /** 节点间距 */
        nodeSpacing: 10,
      },
      nodeCfg: {
        asyncData,
        size: 20,
        style: {
          fill: '#6CE8DC',
          stroke: '#6CE8DC',
        },
        labelCfg: {
          style: {
            fontSize: 5,
            fill: '#000',
          },
        },
      },
      menuCfg: {
        customContent: (e) => {
          return (
            <div>
              <button
                onClick={() => {
                  chartRef.current.emit('node:dblclick', e);
                }}
              >
                手动拓展(双击节点也可以拓展)
              </button>
            </div>
          );
        },
      },
      edgeCfg: {
        style: {
          lineWidth: 1,
        },
        endArrow: {
          d: 10,
          size: 2,
        },
      },
      behaviors: ['drag-canvas', 'zoom-canvas', 'drag-node'],
      onReady: (graph) => {
        chartRef.current = graph;
      },
    };

    return <RadialGraph {...config} />;
  };

  export  const DemoRadialTreeGraphLayout = () => {
    const data = {
      id: 'Modeling Methods',
      children: [
        {
          id: 'Classification',
          children: [
            { id: 'Logistic regression', value: 'Logistic regression' },
            { id: 'Linear discriminant analysis', value: 'Linear discriminant analysis' },
            { id: 'Rules', value: 'Rules' },
            { id: 'Decision trees', value: 'Decision trees' },
            { id: 'Naive Bayes', value: 'Naive Bayes' },
            { id: 'K nearest neighbor', value: 'K nearest neighbor' },
            { id: 'Probabilistic neural network', value: 'Probabilistic neural network' },
            { id: 'Support vector machine', value: 'Support vector machine' },
          ],
          value: 'Classification',
        },
        {
          id: 'Consensus',
          children: [
            {
              id: 'Models diversity',
              children: [
                { id: 'Different initializations', value: 'Different initializations' },
                { id: 'Different parameter choices', value: 'Different parameter choices' },
                { id: 'Different architectures', value: 'Different architectures' },
                { id: 'Different modeling methods', value: 'Different modeling methods' },
                { id: 'Different training sets', value: 'Different training sets' },
                { id: 'Different feature sets', value: 'Different feature sets' },
              ],
              value: 'Models diversity',
            },
            {
              id: 'Methods',
              children: [
                { id: 'Classifier selection', value: 'Classifier selection' },
                { id: 'Classifier fusion', value: 'Classifier fusion' },
              ],
              value: 'Methods',
            },
            {
              id: 'Common',
              children: [
                { id: 'Bagging', value: 'Bagging' },
                { id: 'Boosting', value: 'Boosting' },
                { id: 'AdaBoost', value: 'AdaBoost' },
              ],
              value: 'Common',
            },
          ],
          value: 'Consensus',
        },
        {
          id: 'Regression',
          children: [
            { id: 'Multiple linear regression', value: 'Multiple linear regression' },
            { id: 'Partial least squares', value: 'Partial least squares' },
            {
              id: 'Multi-layer feedforward neural network',
              value: 'Multi-layer feedforward neural network',
            },
            { id: 'General regression neural network', value: 'General regression neural network' },
            { id: 'Support vector regression', value: 'Support vector regression' },
          ],
          value: 'Regression',
        },
      ],
      value: 'Modeling Methods',
    };

    const config = {
      data,
      nodeCfg: {
        type: 'diamond',
      },
      layout: {
        type: 'compactBox',
        direction: 'RL',
        getId: function getId(d) {
          return d.id;
        },
        getHeight: () => {
          return 26;
        },
        getWidth: () => {
          return 26;
        },
        getVGap: () => {
          return 20;
        },
        getHGap: () => {
          return 30;
        },
        radial: true,
      },
      behaviors: ['drag-canvas', 'zoom-canvas', 'drag-node'],
    };

    return <RadialTreeGraph {...config} />;
  };

  export const DemoRadialTreeGraphStyle = () => {
    const data = {
      id: 'Modeling Methods',
      children: [
        {
          id: 'Classification',
          children: [
            { id: 'Logistic regression', value: 'Logistic regression' },
            {
              id: 'Linear discriminant analysis',
              value: 'Linear discriminant analysis',
            },
            { id: 'Rules', value: 'Rules' },
            { id: 'Decision trees', value: 'Decision trees' },
            { id: 'Naive Bayes', value: 'Naive Bayes' },
            { id: 'K nearest neighbor', value: 'K nearest neighbor' },
            {
              id: 'Probabilistic neural network',
              value: 'Probabilistic neural network',
            },
            { id: 'Support vector machine', value: 'Support vector machine' },
          ],
          value: 'Classification',
        },
        {
          id: 'Consensus',
          children: [
            {
              id: 'Models diversity',
              children: [
                {
                  id: 'Different initializations',
                  value: 'Different initializations',
                },
                {
                  id: 'Different parameter choices',
                  value: 'Different parameter choices',
                },
                {
                  id: 'Different architectures',
                  value: 'Different architectures',
                },
                {
                  id: 'Different modeling methods',
                  value: 'Different modeling methods',
                },
                {
                  id: 'Different training sets',
                  value: 'Different training sets',
                },
                { id: 'Different feature sets', value: 'Different feature sets' },
              ],
              value: 'Models diversity',
            },
            {
              id: 'Methods',
              children: [
                { id: 'Classifier selection', value: 'Classifier selection' },
                { id: 'Classifier fusion', value: 'Classifier fusion' },
              ],
              value: 'Methods',
            },
            {
              id: 'Common',
              children: [
                { id: 'Bagging', value: 'Bagging' },
                { id: 'Boosting', value: 'Boosting' },
                { id: 'AdaBoost', value: 'AdaBoost' },
              ],
              value: 'Common',
            },
          ],
          value: 'Consensus',
        },
        {
          id: 'Regression',
          children: [
            {
              id: 'Multiple linear regression',
              value: 'Multiple linear regression',
            },
            { id: 'Partial least squares', value: 'Partial least squares' },
            {
              id: 'Multi-layer feedforward neural network',
              value: 'Multi-layer feedforward neural network',
            },
            {
              id: 'General regression neural network',
              value: 'General regression neural network',
            },
            {
              id: 'Support vector regression',
              value: 'Support vector regression',
            },
          ],
          value: 'Regression',
        },
      ],
      value: 'Modeling Methods',
    };
    const themeColor = '#73B3D1';
    const config = {
      data,
      nodeCfg: {
        size: 30,
        type: 'circle',
        label: {
          style: {
            fill: '#fff',
          },
        },
        style: {
          fill: themeColor,
          stroke: '#0E1155',
          lineWidth: 2,
          strokeOpacity: 0.45,
          shadowColor: themeColor,
          shadowBlur: 25,
        },
        nodeStateStyles: {
          hover: {
            stroke: themeColor,
            lineWidth: 2,
            strokeOpacity: 1,
          },
        },
      },
      edgeCfg: {
        style: {
          stroke: themeColor,
          shadowColor: themeColor,
          shadowBlur: 20,
        },
        endArrow: {
          type: 'triangle',
          fill: themeColor,
          d: 15,
          size: 8,
        },
        edgeStateStyles: {
          hover: {
            stroke: themeColor,
            lineWidth: 2,
          },
        },
      },
      behaviors: ['drag-canvas', 'zoom-canvas', 'drag-node'],
    };

    return (
      <div
        id="dom"
        style={{
          background: '#0E1155',
          height: '400px',
        }}
      >
        <RadialTreeGraph {...config} />
      </div>
    );
  };


  export  const DemoPieCustom = () => {
    const G = G2.getEngine('canvas');
    const data = [
      {
        sex: '男',
        sold: 0.45,
      },
      {
        sex: '女',
        sold: 0.55,
      },
    ];
    const config = {
      appendPadding: 10,
      data,
      angleField: 'sold',
      colorField: 'sex',
      radius: 0.66,
      color: ['#1890ff', '#f04864'],
      label: {
        content: (obj) => {
          const group = new G.Group({});
          group.addShape({
            type: 'image',
            attrs: {
              x: 0,
              y: 0,
              width: 40,
              height: 50,
              img:
                obj.sex === '男'
                  ? 'https://gw.alipayobjects.com/zos/rmsportal/oeCxrAewtedMBYOETCln.png'
                  : 'https://gw.alipayobjects.com/zos/rmsportal/mweUsJpBWucJRixSfWVP.png',
            },
          });
          group.addShape({
            type: 'text',
            attrs: {
              x: 20,
              y: 54,
              text: obj.sex,
              textAlign: 'center',
              textBaseline: 'top',
              fill: obj.sex === '男' ? '#1890ff' : '#f04864',
            },
          });
          return group;
        },
      },
      interactions: [
        {
          type: 'element-active',
        },
      ],
    };
    return <Pie {...config} />;
  };

  export  const DemoPieCustomstatestyle = () => {
    const data = [
      {
        type: '分类一',
        value: 27,
      },
      {
        type: '分类二',
        value: 25,
      },
      {
        type: '分类三',
        value: 18,
      },
      {
        type: '分类四',
        value: 15,
      },
      {
        type: '分类五',
        value: 10,
      },
      {
        type: '其他',
        value: 5,
      },
    ];
    const config = {
      appendPadding: 10,
      data,
      angleField: 'value',
      colorField: 'type',
      radius: 0.8,
      label: {
        type: 'outer',
      },
      // 自定义状态样式
      state: {
        active: {
          style: {
            lineWidth: 0,
            fillOpacity: 0.65,
          },
        },
      },
      // 添加 element 选中和激活交互
      interactions: [
        {
          type: 'element-single-selected',
        },
        {
          type: 'element-active',
        },
      ],
    };
    return <Pie {...config} />;
  };

  export  const DemoColumnLegend = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antfincdn/P14mCvkybz/large-datra.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      xField: 'product_box',
      yField: 'value',
      seriesField: 'province',
      isGroup: 'true',
      legend: {
        flipPage: true,
        // 两行分页
        maxRow: 2,
        pageNavigator: {
          marker: {
            style: {
              fill: 'rgba(0,0,0,0.65)',
            },
          },
        },
      },
    };

    return <Column {...config} />;
  };

  export  const DemoWordCloudBasic = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antfincdn/jPKbal7r9r/mock.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      wordField: 'x',
      weightField: 'value',
      color: '#122c6a',
      wordStyle: {
        fontFamily: 'Verdana',
        fontSize: [24, 80],
      },
      // 设置交互类型
      interactions: [
        {
          type: 'element-active',
        },
      ],
      state: {
        active: {
          // 这里可以设置 active 时的样式
          style: {
            lineWidth: 3,
          },
        },
      },
    };

    return <WordCloud {...config} />;
  };

  export  const DemoWordCloudmask = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antvdemo/assets/data/antv-keywords.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      wordField: 'name',
      weightField: 'value',
      colorField: 'name',
      imageMask: 'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*07tdTIOmvlYAAAAAAAAAAABkARQnAQ',
      wordStyle: {
        fontFamily: 'Verdana',
        fontSize: [8, 32],
      },
    };

    return <WordCloud {...config} />;
  };

  export   const DemoWordCloudbase64 = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antvdemo/assets/data/antv-keywords.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      wordField: 'name',
      weightField: 'value',
      colorField: 'name',
      imageMask:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcoAAADHCAIAAAAWF4ThAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAA5GSURBVHhe7d1teuOoFkXhO5+MJ/PxeDyezKcvyKTixLYEnLMPIK/3Vz9dHxYCluRUrPzvPwCAAHkFAAnyCgAS5BUAJMgrAEiQVwCQIK8AIEFeAUCCvAKABHkFAAnyCgAS5BUAJMgrAEiQVwCQIK8AIEFeAUCCvAKABHkFAAnyCgAS5BUAJMgrAEiQVwCQIK8AIEFeAUCCvAKABHkFAAnyCgAS5BUAJMgrAEiQVwCQIK8AIEFeAUCCvAKABHkFAAnyCgAS5BUAJMgrAEiQVwCQIK8AIEFeAUCCvAKABHkFAAnyCgAS5BUAJMgrAEiQVwCQIK8AIEFeAUCCvAKABHkFAAnyCgAS5BUAJMgrAEiQVwCQIK8AIEFegR7Xz/91+bh8lb8Bp0degR7kFYfIK9CDvOLQafP6daD8tmWVYTwqvw4x8opDJ8hrSsr1erl8fn5+JGUR18t/6CP94c/L5Xq9Ttmn2wjbBngbVRoSwdUgrzi0Zl5TblJPO1pabXybtqK6DfEjXz1iBvOVDztCviZm23UxXxhDJ4u84tBSeU1RlTb1lcA2qceYoqQeyddlwBTd2cKbL43leETIKw4tkdctOWV1DpU2rqqz6YY88NKhjOzovP6imzHyikNz53Wart77vJajczJskKLGTpXXb9tdu+toySsOzZrXKcN645fXCQaZbu68d/uUeS0c72XJKw5NmNf8LrksxSm55HWmy4fzXezMed34NJa84tBceZ29rBt7Xq/zBchx00+f1435mkJeZxb9fSQvzJPX/P08ZQXOzSGvnTtTy2vfr5HXzDRi8jqf9J4wVeS2/Lz/iaTLHHldZ0cmZ81r4vN1j5UmM93ElsNuRV4nkb8J/vPx1oy8bpbajdmJ8+qyKFeb0M7Ckteh7m9UnyKveY0u1tbk1Hl1GN5y18u+5JHXeOXTmuVM7nv3vH5NXZnXTp5X8wAXzGtP9MhrlL6Ph791Xldta3L6vBoLsGRe2wdNXkN0r6Y3zuu6bU1myGt+okn5TwnLGBfNa2v4yGsI8tpo6bYm0Xn9fkLJy+/kS79Q/yWpSoZBLpvXtlGT1xDktYV4730/LWmL0Ysc3X7pKz/ELn9Hx/YU1fLHqwTldftsUeNO3J4LU/68Uf8o+6f4I494123S8vfhaO7eG9pHXkOQ13qiG9fbY5Gsq3bbvRVfQxfndXv4SPmNfXwuYd3DtOS1deD5Wx5dO1t/COQ1BHmt5LPrf3F8QscfO2+3ZXl1HI3Hvxz2jjMyr4Xjh6mrj4G8hiCvVZzjqgvrH4/3R4q8CoZjDmxvBwbkdePU2NqDIK8hyGsFz7iGlfXeXWW985q/4lh+wZc1sJ0DHZXXzKOwlUdBXkOQ10N+cXV+dl6rLbKOeU1XCuVwjOe9MwQj85pYLyq1G5O8hiCvB9ziepqFeduZAcMxnvq+FTo4rw6BrRo3eQ1BXvfZ7yY2Y29bfaW3sEF7zHbyF82r+YJedRzkNQR53WNd6TdTnKoV2U5/XwnG59W86mrWG3kNQV53eNy6num+NZxpApbNq7WvZ8/r7TMatw9p/FJ+ofy2GZDXl6w3ERk3riZvmlfj0qs5kIXyun1epv2jbrePQF7sH9ixIK+v2G9dZ7jSr800B30rdIq86q8r0+c1RfXS/hy/l24fjSx/t5/8M6B2lZfvUP6CCrJv4BHm1VxX4mr3tnk13b4undeUVceqPsrfHDnJPHmRzYkur9a6ElcHtsX7tnmtGfmEeX38hKGO170see1hPmtTfOlkeaZrXOeiI6+7NFvZ8akLLewf8yGvHawnTTbe9yJvzDMnyGvNgUyT10Fl/WEaEXntYPzKALeuLmxLt3fNkdddrlt5eFq/dY+KvLaz1VU22DdjXLm917g58mpagjUHMj6vs6T1W9cXCshrM+o6g0F1PUNea8Y+Nq/ptrX8fVNpHxx5bWU7Y9TVh3H/9U/DFHk1jb7qOAbmdYokvdI4PvLaSr+0ccS6ag3TMENebcOvunEfllfjdTNAyxsf8trINv3d70nxw7xmLbMwQV4jluCYvE5Ro2P1gySvbWzni7ra2VesaRbG59VW18qjGJFX28BiVa4h8trGtARk43wf9i1onITReTWegNqDiM/rSnHNqgJLXtuYFoH15rU8UC1MedlpeCxW8xwMzau1QdXHEJ1Xz7jmJ2H9PH7wn/S/tudqld9lVjNU8trEdLqMw4yfKmuKXLkM377SxuXV4buV6g8hNq8+ca1+UIDXY2EqBvvkqbP3up+i8JEvILVs6+4197ya1oGxVu+cV5+x2+NqORLLq39dPU5Aw3xG5tVhcnueDuBxToe9F5pia5JXk0ny6jVwl+GE59XtQVFNrx+YV/Otq+XBK9a1ZblmJuT1nmkyjDPhVpl6M8yh26idBtN/PG3znx8X7foAvrbxx+XVWFf7tNpWmG1Xd782ef2LvLbye6SH9dz/MOR1+weXV/KPM8ny4+XLH/DUegKi8jqybf/YDsKyS7pfmbz+RV6bOA7XL64jZsFB+wkIyuvQDXXHdByGbdL9uuT1L/JazXWovqOInwWznhMQk1fLyXSMa2b5GkX/Cus+AeT1L/JaJf/0t/L6DszPm/9rtbx2rrqQvFrOpfvaNBxM/87uflHy+hd5PeT8/GTrGX8mfhYsumcwJK/9d4yTzWz34ZDXe7a9ZTwlJ8+r9/AUOzCJn4Vuljv3iLzOVVfT1PbulO6XJK8PyOsr7kNz/5rAP/Gz0MX6U/gC8tp/JkVXzgFH1P2Kp8yr4YKbGFdF/MYOmUP3Yak23038LLRzOAMBee3fS7J1GX5I5PUX8urKf0i629Zi9rw6XVz0ee0/kU5DfCL8mLpf8Jx5tW0u2zmJ39jSOfQfjm7b3YmfhWr2H8v/Q5/XCW9e4w+KvP5i21y2/X+ivDp/h0DimZZdc+Y1D991/BPnVXkV7Z9d8uqh//KW2U7KwcPNXunvgWYO3QMVltZstrxWP4WvjTyv0SGrQ15b+OfVuLtGnJXoNzx73G9bQ9OaTZPXD/c71nvktVHfPTV5/cN2+6p8Y/PKNHn1LlN4WrPReU1VTber8nGT10bk1YVxew3o6xx5dc7Sh+QtcQXncVT4SEX9vFzyTzcpxxBg3rxKd1D/7JJXH7bb1wF9nSCvrk1Kt2/Rp/COYQPuPpDwl/LTocpLjkBeG5FXJ8a+hp+Z4Xm1nrA7Y9OaRW/AQebNq3T/RB8VeX3QPwVF8KkZm1e/f8sa8qXWB+R1F3ltQl4fmfsau9FG5tXrxnWOtGbkddfiee1er52TS16fMPc19OwMy6v9NN1M1SXyuqt+kNElq0JeW4jy6hGOuPMzKK8+cZ2uSeR1V0BehVunf3I7j4m8PuXRjqgzNGQd97/oj3m+InCHvO6qH+SMJ7J71fYeEnl9zqOvQedoQF4dzs6sMSKvuxoGOWBdHog/IvL6gktfQ7Zc+KKxn5qJS0RedzUM0rBMNHEZMLXdL3n2vFqy9Yv8REXn1Xpe5s4Qed3VMsjJ+jpiZsnra4bl8cuH9lzF5tUY1+kbRF53NQ3SsFb8t8yQ2JPXPcaW3BHuvci8Gq84CxSIvO5qG6Rh/3ifzTGp715NUywmdV6tOflF9Q/lgXm1nY4prshHyOuuxkEaoua6XCwL13Ic/a87w2aR59U3sIngSVBxebVsllXqQ153tQ7StGS8EmPaw6aDMLzyBH0NyKtxhTyV72P9tmJYXt+hruR1X/MgbbvH45ya4mo9AMPwx/c1JK/WJfKK/XH0X/mHA4RdmN+iruR1X/sgrZvHdlpNbXWYU8vohy+ooLyaZ2lffkD99jTlmrOZftf1evl0eU5VU17N2yRc1+WfvO7qGKR973T+q4X9JxPZbyBtgx+8pMLy6rFIqpU6/FF+0VPL6gkcvxfy+lpgXu1X5k3Tez2Xn/lmj2tivis5OOFppLJnJAfmNXFZJTNpWD8L1pW87gjNq+fW2X4W2dN3evnnP1wvF6/nDztNp8fG2cZ8P+TyFrbcc8kWXmxe14zMjob+rHhpIa+vBed1uZ3jN5n6nXOavCZnKmx9f5YcNXl9LTqvyUJXaM+p1G+dM+U1OU1hyesj8rrLNMhFAtu1bl6T752T5TU5R2Hr19FCdx4/yOtrQ/K6wr4RzKJ60OfLa+Lyj5NjkddH5HWXfZBTbxvnG9dv2u1zyrxmiyeWvD4ir7tcBjnnrun7Puk60hvY0+Y1Wzix5PURed3lNUj1G+ZW8skT7qBT5zX7yt+EVga7hu076crRVyCvx8hrm2nuSzo/FNZKtodOn9fNIo3dHnVQDrkaeT1GXtsNT2xQWm9Eg32PvN7kBTNpZBvvWO+R12Pktc+o2xLDduinKOw75fVmqjvZ20fqypH1Ia/HyKtB7IYZUtZv7l92fr+8FvlD0MMym9aQ2yIir8fIq5l8u2xfGZtgmr48x/m2ef1n62xAaNPysd+qPkFej5FXL7e7Es/dcnsoSvnrZ+HydUTlwJbJ653ytJt0Zs3nNv8Vn6mn1Q+LBZaSQ7vtlbLiW2y3Gop7DWfbEBtHmDe+fmgr5vVRSmNO7k1aTE+kgBbbbyaleEPb0r9tg4dtku8xsqV3x/fw8iXll+/9Hzu6c+QVAKZDXgFAgrwCgAR5BQAJ8goAEuQVACTIKwBIkFcAkCCvACBBXgFAgrwCgAR5BQAJ8goAEuQVACTIKwBIkFcAkCCvACBBXgFAgrwCgAR5BQAJ8goAEuQVACTIKwBIkFcAkCCvACBBXgFAgrwCgAR5BQAJ8goAEuQVACTIKwBIkFcAkCCvACBBXgFAgrwCgAR5BQAJ8goAEuQVACTIKwBIkFcAkCCvACBBXgFAgrwCgAR5BQAJ8goAEuQVAAT+++//CT3TAOpn61kAAAAASUVORK5CYII=',
      wordStyle: {
        fontFamily: 'Verdana',
        fontSize: [8, 32],
      },
    };

    return <WordCloud {...config} />;
  };

  export  const DemoWordCloudField = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antvdemo/assets/data/antv-keywords.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      wordField: 'name',
      weightField: 'value',
      colorField: 'value',
      imageMask: 'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*07tdTIOmvlYAAAAAAAAAAABkARQnAQ',
      wordStyle: {
        fontFamily: 'Verdana',
        fontSize: [8, 32],
      },
    };

    return <WordCloud {...config} />;
  };

  export  const DemoWordCloudunchanged = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antvdemo/assets/data/antv-keywords.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      wordField: 'name',
      weightField: 'value',
      colorField: 'name',
      wordStyle: {
        fontFamily: 'Verdana',
        fontSize: [8, 32],
        rotation: 0,
      },
      // 返回值设置成一个 [0, 1) 区间内的值，
      // 可以让每次渲染的位置相同（前提是每次的宽高一致）。
      random: () => 0.5,
    };

    return <WordCloud {...config} />;
  };

  export  const DemoWordCloudDouBan = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antfincdn/%24IWXp5slbE/2020-movie-from-douban.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      wordField: 'title',
      weightField: 'rate',
      colorField: 'tag',
      legend: {},
      imageMask: 'https://gw.alipayobjects.com/zos/antfincdn/Qw7Xbn76kM/53176454-747c-4f0a-a9e5-936aa66a0082.png',
      wordStyle: {
        fontFamily: 'Avenir',
        fontSize: [8, 16],
      },
      state: {
        active: {
          style: {
            lineWidth: 0,
            shadowBlur: 4,
            shadowColor: 'rgba(0,0,0,0.3)',
          },
        },
      },
    };

    return <WordCloud {...config} />;
  };

  export const DemoHeatmapCalendar = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antvdemo/assets/data/github-commit.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    G2.registerShape('polygon', 'boundary-polygon', {
      draw(cfg, container) {
        const group = container.addGroup();
        const attrs = {
          stroke: '#fff',
          lineWidth: 1,
          fill: cfg.color,
          paht: [],
        };
        const points = cfg.points;
        const path = [
          ['M', points[0].x, points[0].y],
          ['L', points[1].x, points[1].y],
          ['L', points[2].x, points[2].y],
          ['L', points[3].x, points[3].y],
          ['Z'],
        ]; // @ts-ignore

        attrs.path = this.parsePath(path);
        group.addShape('path', {
          attrs,
        });

        if (cfg.data.lastWeek) {
          const linePath = [
            ['M', points[2].x, points[2].y],
            ['L', points[3].x, points[3].y],
          ]; // 最后一周的多边形添加右侧边框

          group.addShape('path', {
            attrs: {
              path: this.parsePath(linePath),
              lineWidth: 4,
              stroke: '#404040',
            },
          });

          if (cfg.data.lastDay) {
            group.addShape('path', {
              attrs: {
                path: this.parsePath([
                  ['M', points[1].x, points[1].y],
                  ['L', points[2].x, points[2].y],
                ]),
                lineWidth: 4,
                stroke: '#404040',
              },
            });
          }
        }

        return group;
      },
    });
    const config = {
      data,
      height: 400,
      autoFit: false,
      xField: 'week',
      yField: 'day',
      colorField: 'commits',
      reflect: 'y',
      shape: 'boundary-polygon',
      meta: {
        day: {
          type: 'cat',
          values: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        },
        week: {
          type: 'cat',
        },
        commits: {
          sync: true,
        },
        date: {
          type: 'cat',
        },
      },
      yAxis: {
        grid: null,
      },
      tooltip: {
        title: 'date',
        showMarkers: false,
      },
      interactions: [
        {
          type: 'element-active',
        },
      ],
      xAxis: {
        position: 'top',
        tickLine: null,
        line: null,
        label: {
          offset: 12,
          style: {
            fontSize: 12,
            fill: '#666',
            textBaseline: 'top',
          },
          formatter: (val) => {
            if (val === '2') {
              return 'MAY';
            } else if (val === '6') {
              return 'JUN';
            } else if (val === '10') {
              return 'JUL';
            } else if (val === '15') {
              return 'AUG';
            } else if (val === '19') {
              return 'SEP';
            } else if (val === '24') {
              return 'OCT';
            }

            return '';
          },
        },
      },
    };

    return <Heatmap {...config} />;
  };

  export  const DemoHeatmapPolar = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antvdemo/assets/data/polar-heatmap.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      xField: 'time',
      yField: 'week',
      colorField: 'value',
      legend: true,
      color: '#BAE7FF-#1890FF-#1028ff',
      coordinate: {
        // 坐标轴属性配置
        type: 'polar',
        // 极坐标
        cfg: {
          innerRadius: 0.2,
        },
      },
      heatmapStyle: {
        stroke: '#f5f5f5',
        opacity: 0.8,
      },
      meta: {
        time: {
          type: 'cat',
        },
        value: {
          min: 0,
          max: 1,
        },
      },
      xAxis: {
        line: null,
        grid: null,
        tickLine: null,
        label: {
          offset: 12,
          style: {
            fill: '#666',
            fontSize: 12,
            textBaseline: 'top',
          },
        },
      },
      yAxis: {
        top: true,
        line: null,
        grid: null,
        tickLine: null,
        label: {
          offset: 0,
          style: {
            fill: '#fff',
            textAlign: 'center',
            shadowBlur: 2,
            shadowColor: 'rgba(0, 0, 0, .45)',
          },
        },
      },
      tooltip: {
        showMarkers: false,
      },
      interactions: [
        {
          type: 'element-active',
        },
      ],
    };

    return <Heatmap {...config} />;
  };


  export  const DemoHeatmapShape = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/bmw-prod/68d3f380-089e-4683-ab9e-4493200198f9.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      xField: 'name',
      yField: 'country',
      colorField: 'value',
      shape: 'circle',
      sizeRatio: 0.5,
      color: ['#0d5fbb', '#7eadfc', '#fd8b6f', '#aa3523'],
      label: {
        style: {
          fill: '#fff',
          shadowBlur: 2,
          shadowColor: 'rgba(0, 0, 0, .45)',
        },
      },
    };

    return <Heatmap {...config} />;
  };

  export   const DemoHeatmapmapping = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/bmw-prod/68d3f380-089e-4683-ab9e-4493200198f9.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      xField: 'name',
      yField: 'country',
      colorField: 'value',
      sizeField: 'value',
      shape: 'square',
      color: ['#dddddd', '#9ec8e0', '#5fa4cd', '#2e7ab6', '#114d90'],
      label: {
        style: {
          fill: '#fff',
          shadowBlur: 2,
          shadowColor: 'rgba(0, 0, 0, .45)',
        },
      },
    };

    return <Heatmap {...config} />;
  };

  export  const DemoHeatmapBasic = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/basement_prod/a719cd4e-bd40-4878-a4b4-df8a6b531dfe.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      width: 650,
      height: 500,
      autoFit: false,
      data,
      xField: 'Month of Year',
      yField: 'District',
      colorField: 'AQHI',
      color: ['#174c83', '#7eb6d4', '#efefeb', '#efa759', '#9b4d16'],
      meta: {
        'Month of Year': {
          type: 'cat',
        },
      },
    };

    return <Heatmap {...config} />;
  };

  export  const DemoHeatmapDensity = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antvdemo/assets/data/heatmap.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      type: 'density',
      xField: 'g',
      yField: 'l',
      colorField: 'tmp',
      color: '#F51D27-#FA541C-#FF8C12-#FFC838-#FAFFA8-#80FF73-#12CCCC-#1890FF-#6E32C2',
      legend: {
        position: 'bottom',
      },
      annotations: [
        {
          type: 'image',
          start: ['min', 'max'],
          end: ['max', 'min'],
          src: 'https://gw.alipayobjects.com/zos/rmsportal/NeUTMwKtPcPxIFNTWZOZ.png',
        },
      ],
    };

    return <Heatmap {...config} />;
  };

  export  const DemoTreemapDrill = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antfincdn/k5SYI%24mOo1/treemap.json')
        .then((response) => response.json())
        .then((list) => setData(list))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data: data,
      colorField: 'name',
      legend: {
        position: 'top-left',
      },
      tooltip: {
        formatter: (v) => {
          const root = v.path[v.path.length - 1];
          return {
            name: v.name,
            value: `${v.value}(总占比${((v.value / root.value) * 100).toFixed(2)}%)`,
          };
        },
      },
      // use `drilldown: { enabled: true }` to
      // replace `interactions: [{ type: 'treemap-drill-down' }]`
      interactions: [
        {
          type: 'treemap-drill-down',
        },
      ],
      // drilldown: {
      //   enabled: true,
      //   breadCrumb: {
      //     rootText: '初始',
      //   },
      // },
      // 开启动画
      animation: {},
    };

    return <Treemap {...config} />;
  };

  export  const DemoTreemapBasic = () => {
    const data = {
      name: 'root',
      children: [
        {
          name: '分类 1',
          value: 560,
        },
        {
          name: '分类 2',
          value: 500,
        },
        {
          name: '分类 3',
          value: 150,
        },
        {
          name: '分类 4',
          value: 140,
        },
        {
          name: '分类 5',
          value: 115,
        },
        {
          name: '分类 6',
          value: 95,
        },
        {
          name: '分类 7',
          value: 90,
        },
        {
          name: '分类 8',
          value: 75,
        },
        {
          name: '分类 9',
          value: 98,
        },
        {
          name: '分类 10',
          value: 60,
        },
        {
          name: '分类 11',
          value: 45,
        },
        {
          name: '分类 12',
          value: 40,
        },
        {
          name: '分类 13',
          value: 40,
        },
        {
          name: '分类 14',
          value: 35,
        },
        {
          name: '分类 15',
          value: 40,
        },
        {
          name: '分类 16',
          value: 40,
        },
        {
          name: '分类 17',
          value: 40,
        },
        {
          name: '分类 18',
          value: 30,
        },
        {
          name: '分类 19',
          value: 28,
        },
        {
          name: '分类 20',
          value: 16,
        },
      ],
    };
    const config = {
      data,
      colorField: 'name',
    };
    return <Treemap {...config} />;
  };

  export   const DemoRadarBasic = () => {
    // 数据更新于 2021.01.09
    const data = [
      {
        name: 'G2',
        star: 10371,
      },
      {
        name: 'G6',
        star: 7380,
      },
      {
        name: 'F2',
        star: 7414,
      },
      {
        name: 'L7',
        star: 2140,
      },
      {
        name: 'X6',
        star: 660,
      },
      {
        name: 'AVA',
        star: 885,
      },
      {
        name: 'G2Plot',
        star: 1626,
      },
    ];
    const config = {
      data: data.map((d) => ({ ...d, star: Math.sqrt(d.star) })),
      xField: 'name',
      yField: 'star',
      appendPadding: [0, 10, 0, 10],
      meta: {
        star: {
          alias: 'star 数量',
          min: 0,
          nice: true,
          formatter: (v) => Number(v).toFixed(2),
        },
      },
      xAxis: {
        tickLine: null,
      },
      yAxis: {
        label: false,
        grid: {
          alternateColor: 'rgba(0, 0, 0, 0.04)',
        },
      },
      // 开启辅助点
      point: {
        size: 2,
      },
      area: {},
    };
    return <Radar {...config} />;
  };

  export   const DemoRadar = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antfincdn/svFjSfJkYy/radar.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      xField: 'item',
      yField: 'score',
      seriesField: 'user',
      meta: {
        score: {
          alias: '分数',
          min: 0,
          max: 80,
        },
      },
      xAxis: {
        line: null,
        tickLine: null,
        grid: {
          line: {
            style: {
              lineDash: null,
            },
          },
        },
      },
      // 开启辅助点
      point: {
        size: 2,
      },
    };

    return <Radar {...config} />;
  };

  export  const DemoRadarWithGrid = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antfincdn/svFjSfJkYy/radar.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      xField: 'item',
      yField: 'score',
      seriesField: 'user',
      meta: {
        score: {
          alias: '分数',
          min: 0,
          max: 80,
        },
      },
      xAxis: {
        line: null,
        tickLine: null,
        grid: {
          line: {
            style: {
              lineDash: null,
            },
          },
        },
      },
      yAxis: {
        line: null,
        tickLine: null,
        grid: {
          line: {
            type: 'line',
            style: {
              lineDash: null,
            },
          },
        },
      },
      // 开启辅助点
      point: {
        size: 2,
      },
    };

    return <Radar {...config} />;
  };

  export  const DemoRadarwithAlternateGrid = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antfincdn/svFjSfJkYy/radar.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      xField: 'item',
      yField: 'score',
      seriesField: 'user',
      meta: {
        score: {
          alias: '分数',
          min: 0,
          max: 80,
        },
      },
      xAxis: {
        line: null,
        tickLine: null,
        grid: {
          line: {
            style: {
              lineDash: null,
            },
          },
        },
      },
      yAxis: {
        line: null,
        tickLine: null,
        grid: {
          line: {
            type: 'line',
            style: {
              lineDash: null,
            },
          },
          alternateColor: 'rgba(0, 0, 0, 0.04)',
        },
      },
      // 开启辅助点
      point: {
        size: 2,
      },
    };

    return <Radar {...config} />;
  };

  export  const DemoRadarArea = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antfincdn/svFjSfJkYy/radar.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      xField: 'item',
      yField: 'score',
      seriesField: 'user',
      meta: {
        score: {
          alias: '分数',
          min: 0,
          max: 80,
        },
      },
      xAxis: {
        line: null,
        tickLine: null,
        grid: {
          line: {
            style: {
              lineDash: null,
            },
          },
        },
      },
      // 开启面积
      area: {},
      // 开启辅助点
      point: {
        size: 2,
      },
    };

    return <Radar {...config} />;
  };

  export  const DemoRoseBasic = () => {
    const data = [
      {
        type: '分类一',
        value: 27,
      },
      {
        type: '分类二',
        value: 25,
      },
      {
        type: '分类三',
        value: 18,
      },
      {
        type: '分类四',
        value: 15,
      },
      {
        type: '分类五',
        value: 10,
      },
      {
        type: '其他',
        value: 5,
      },
    ];
    const config = {
      data,
      xField: 'type',
      yField: 'value',
      seriesField: 'type',
      radius: 0.9,
      legend: {
        position: 'bottom',
      },
    };
    return <Rose {...config} />;
  };

  export  const DemoRoseinnerlabel = () => {
    const data = [
      {
        type: '分类一',
        value: 27,
      },
      {
        type: '分类二',
        value: 25,
      },
      {
        type: '分类三',
        value: 18,
      },
      {
        type: '分类四',
        value: 15,
      },
      {
        type: '分类五',
        value: 10,
      },
      {
        type: '其他',
        value: 5,
      },
    ];
    const config = {
      data,
      xField: 'type',
      yField: 'value',
      seriesField: 'type',
      radius: 0.9,
      label: {
        offset: -15,
      },
    };
    return <Rose {...config} />;
  };

  export  const DemoRoseState = () => {
    const data = [
      {
        type: '分类一',
        value: 27,
      },
      {
        type: '分类二',
        value: 25,
      },
      {
        type: '分类三',
        value: 18,
      },
      {
        type: '分类四',
        value: 15,
      },
      {
        type: '分类五',
        value: 10,
      },
      {
        type: '其他',
        value: 5,
      },
    ];
    const config = {
      data,
      xField: 'type',
      yField: 'value',
      seriesField: 'type',
      radius: 0.9,
      // 设置 active 状态样式
      state: {
        active: {
          style: {
            lineWidth: 0,
            fillOpacity: 0.65,
          },
        },
      },
      legend: {
        position: 'bottom',
      },
      interactions: [
        {
          type: 'element-active',
        },
      ],
    };
    return <Rose {...config} />;
  };

  export   const DemoRoseElementActio = () => {
    const data = [
      {
        type: '分类一',
        value: 27,
      },
      {
        type: '分类二',
        value: 25,
      },
      {
        type: '分类三',
        value: 18,
      },
      {
        type: '分类四',
        value: 15,
      },
      {
        type: '分类五',
        value: 10,
      },
      {
        type: '其他',
        value: 5,
      },
    ];
    const config = {
      data,
      xField: 'type',
      yField: 'value',
      seriesField: 'type',
      radius: 0.9,
      legend: {
        position: 'bottom',
      },
      interactions: [
        {
          type: 'element-active',
        },
      ],
    };
    return <Rose {...config} />;
  };

  export   const DemoRoseGrouped = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antfincdn/XcLAPaQeeP/rose-data.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    // 分组玫瑰图
    const config = {
      data,
      xField: 'type',
      yField: 'value',
      isGroup: true,
      // 当 isGroup 为 true 时，该值为必填
      seriesField: 'user',
      radius: 0.9,
      label: {
        offset: -15,
      },
      interactions: [
        {
          type: 'element-active',
        },
      ],
    };

    return <Rose {...config} />;
  };

  export  const DemoRosestacked = () => {
    const data = [
      {
        type: '分类一',
        value: 27,
        user: '用户一',
      },
      {
        type: '分类二',
        value: 25,
        user: '用户一',
      },
      {
        type: '分类三',
        value: 18,
        user: '用户一',
      },
      {
        type: '分类四',
        value: 15,
        user: '用户一',
      },
      {
        type: '分类五',
        value: 10,
        user: '用户一',
      },
      {
        type: '其它',
        value: 5,
        user: '用户一',
      },
      {
        type: '分类一',
        value: 7,
        user: '用户二',
      },
      {
        type: '分类二',
        value: 5,
        user: '用户二',
      },
      {
        type: '分类三',
        value: 38,
        user: '用户二',
      },
      {
        type: '分类四',
        value: 5,
        user: '用户二',
      },
      {
        type: '分类五',
        value: 20,
        user: '用户二',
      },
      {
        type: '其它',
        value: 15,
        user: '用户二',
      },
    ]; // 堆叠玫瑰图

    const config = {
      data,
      xField: 'type',
      yField: 'value',
      isStack: true,
      // 当 isStack 为 true 时，该值为必填
      seriesField: 'user',
      radius: 0.9,
      label: {
        offset: -15,
      },
      interactions: [
        {
          type: 'element-active',
        },
      ],
    };
    return <Rose {...config} />;
  };

  export  const DemoChord = () => {
    const DATA = [
      {
        source: '北京',
        target: '天津',
        value: 30,
      },
      {
        source: '北京',
        target: '上海',
        value: 80,
      },
      {
        source: '北京',
        target: '河北',
        value: 46,
      },
      {
        source: '北京',
        target: '辽宁',
        value: 49,
      },
      {
        source: '北京',
        target: '黑龙江',
        value: 69,
      },
      {
        source: '北京',
        target: '吉林',
        value: 19,
      },
      {
        source: '天津',
        target: '河北',
        value: 62,
      },
      {
        source: '天津',
        target: '辽宁',
        value: 82,
      },
      {
        source: '天津',
        target: '上海',
        value: 16,
      },
      {
        source: '上海',
        target: '黑龙江',
        value: 16,
      },
      {
        source: '河北',
        target: '黑龙江',
        value: 76,
      },
      {
        source: '河北',
        target: '内蒙古',
        value: 24,
      },
      {
        source: '内蒙古',
        target: '北京',
        value: 32,
      },
    ];
    const config = {
      data: DATA,
      sourceField: 'source',
      targetField: 'target',
      weightField: 'value',
    };
    return <Chord {...config} />;
  };

  export  const DemoSunburstBasic = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antfincdn/ryp44nvUYZ/coffee.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      innerRadius: 0.3,
      interactions: [
        {
          type: 'element-active',
        },
      ],
    };

    return <Sunburst {...config} />;
  };

  export  const DemoSunburstColor = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antvdemo/assets/data/sunburst.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      innerRadius: 0.3,
      colorField: 'label',
      interactions: [
        {
          type: 'element-active',
        },
      ],
      hierarchyConfig: {
        field: 'sum',
      },
    };

    return <Sunburst {...config} />;
  };

  export   const DemoSunburstlabel = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antvdemo/assets/data/sunburst.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      innerRadius: 0.2,
      radius: 1,
      interactions: [
        {
          type: 'element-active',
        },
      ],
      hierarchyConfig: {
        field: 'sum',
      },
      label: {
        // label layout: limit label in shape, which means the labels out of shape will be hide
        layout: [
          {
            type: 'limit-in-shape',
          },
        ],
      },
    };

    return <Sunburst {...config} />;
  };

  export   const DemoRadialBar = () => {
    const data = [
      {
        name: 'X6',
        star: 297,
      },
      {
        name: 'G',
        star: 506,
      },
      {
        name: 'AVA',
        star: 805,
      },
      {
        name: 'G2Plot',
        star: 1478,
      },
      {
        name: 'L7',
        star: 2029,
      },
      {
        name: 'G6',
        star: 7100,
      },
      {
        name: 'F2',
        star: 7346,
      },
      {
        name: 'G2',
        star: 10178,
      },
    ];
    const config = {
      data,
      xField: 'name',
      yField: 'star',
      // maxAngle: 90, //最大旋转角度,
      radius: 0.8,
      innerRadius: 0.2,
      tooltip: {
        formatter: (datum) => {
          return {
            name: 'star数',
            value: datum.star,
          };
        },
      },
    };
    return <RadialBar {...config} />;
  };

  export  const DemoRadialBarColor = () => {
    const data = [
      {
        name: 'X6',
        star: 297,
      },
      {
        name: 'G',
        star: 506,
      },
      {
        name: 'AVA',
        star: 805,
      },
      {
        name: 'G2Plot',
        star: 1478,
      },
      {
        name: 'L7',
        star: 2029,
      },
      {
        name: 'G6',
        star: 7100,
      },
      {
        name: 'F2',
        star: 7346,
      },
      {
        name: 'G2',
        star: 10178,
      },
    ];
    const config = {
      data,
      xField: 'name',
      yField: 'star',
      maxAngle: 270,
      //最大旋转角度,
      radius: 0.8,
      innerRadius: 0.2,
      tooltip: {
        formatter: (datum) => {
          return {
            name: 'star数',
            value: datum.star,
          };
        },
      },
      colorField: 'star',
      color: ({ star }) => {
        if (star > 10000) {
          return '#36c361';
        } else if (star > 1000) {
          return '#2194ff';
        }

        return '#ff4d4f';
      },
    };
    return <RadialBar {...config} />;
  };

  export  const DemoRadialBarStacked = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antfincdn/8elHX%26irfq/stack-column-data.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      xField: 'year',
      yField: 'value',
      colorField: 'type',
      isStack: true,
      maxAngle: 270,
    };

    return <RadialBar {...config} />;
  };

  export  const DemoRadialBarBackground = () => {
    const data = [
      {
        name: 'X6',
        star: 297,
      },
      {
        name: 'G',
        star: 506,
      },
      {
        name: 'AVA',
        star: 805,
      },
      {
        name: 'G2Plot',
        star: 1478,
      },
      {
        name: 'L7',
        star: 2029,
      },
      {
        name: 'G6',
        star: 7100,
      },
      {
        name: 'F2',
        star: 7346,
      },
      {
        name: 'G2',
        star: 10178,
      },
    ];
    const config = {
      data,
      xField: 'name',
      yField: 'star',
      maxAngle: 350,
      //最大旋转角度,
      radius: 0.8,
      innerRadius: 0.2,
      tooltip: {
        formatter: (datum) => {
          return {
            name: 'star数',
            value: datum.star,
          };
        },
      },
      colorField: 'star',
      color: ({ star }) => {
        if (star > 10000) {
          return '#6349ec';
        } else if (star > 1000) {
          return '#ff9300';
        }

        return '#ff93a7';
      },
      barBackground: {},
      barStyle: {
        lineCap: 'round',
      },
      annotations: [
        {
          type: 'html',
          position: ['50%', '50%'],
          html: (container, view) => {
            const coord = view.getCoordinate();
            const w = coord.polarRadius * coord.innerRadius * 1.15;
            return `<div style="transform:translate(-50%,-46%)">
            <img width="${(w / 203) * 231
              }" height="${w}" alt="" src="https://gw.alipayobjects.com/zos/antfincdn/zrh%24J08soH/AntV%252520LOGO%2525202.png">
          </div>`;
          },
        },
      ],
    };
    return <RadialBar {...config} />;
  };

  export   const DemoRadialBarLine = () => {
    const data = [
      {
        term: 'Zombieland',
        count: 9,
      },
      {
        term: 'Wieners',
        count: 8,
      },
      {
        term: 'Toy Story',
        count: 8,
      },
      {
        term: 'trashkannon',
        count: 7,
      },
      {
        term: 'the GROWLERS',
        count: 6,
      },
      {
        term: 'mudweiser',
        count: 6,
      },
      {
        term: 'ThunderCats',
        count: 4,
      },
      {
        term: 'The Taqwacores - Motion Picture',
        count: 4,
      },
      {
        term: 'The Shawshank Redemption',
        count: 2,
      },
      {
        term: 'The Olivia Experiment',
        count: 1,
      },
    ];
    const config = {
      data,
      xField: 'term',
      yField: 'count',
      radius: 1,
      innerRadius: 0.4,
      // 设置坐标系的起始角度和终止角度
      startAngle: Math.PI * 0.5,
      endAngle: Math.PI * 2.5,
      tooltip: {
        showMarkers: true,
      },
      type: 'line',
      annotations: [
        {
          type: 'text',
          position: ['50%', '50%'],
          content: 'Music',
          style: {
            textAlign: 'center',
            fontSize: 24,
          },
        },
      ],
    };
    return <RadialBar {...config} />;
  };

  export  const DemoRadialBarActivity = () => {
    const data = [
      {
        name: 'activity1',
        percent: 2370,
        color: '#1ad5de',
        icon: 'https://gw.alipayobjects.com/zos/antfincdn/ck11Y6aRrz/shangjiantou.png',
      },
      {
        name: 'activity2',
        percent: 800,
        color: '#a0ff03',
        icon: 'https://gw.alipayobjects.com/zos/antfincdn/zY2JB7hhrO/shuangjiantou.png',
      },
      {
        name: 'activity3',
        percent: 650,
        color: '#e90b3a',
        icon: 'https://gw.alipayobjects.com/zos/antfincdn/%24qBxSxdK05/jiantou.png',
      },
    ];
    const config = {
      width: 400,
      height: 244,
      autoFit: false,
      appendPadding: [50, 0, 50, 0],
      data,
      xField: 'name',
      yField: 'percent',
      // maxAngle: 90, //最大旋转角度,
      radius: 0.8,
      innerRadius: 0.2,
      xAxis: false,
      theme: 'dark',
      barBackground: {
        style: {
          fill: 'rgba(255,255,255,0.45)',
        },
      },
      barStyle: {
        lineCap: 'round',
      },
      minBarWidth: 16,
      maxBarWidth: 16,
      colorField: 'name',
      color: ({ name }) => {
        return data.find((d) => d.name === name).color;
      },
      annotations: data.map((d) => ({
        type: 'html',
        position: [d.name, 0],
        html: `<div style="width:11px;height:11px;transform:translate(-50%, -50%)">
        <img
          style="width:11px;height:11px;display: block;"
          src="${d.icon}"
          alt=""
        />
      </div>`,
      })),
    };
    return <RadialBar {...config} />;
  };

  export  const DemoCirclePacking = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antfincdn/%24m0nDoQYqH/basic-packing.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      autoFit: true,
      data,
      label: false,
      legend: false,
      hierarchyConfig: {
        sort: (a, b) => b.depth - a.depth,
      },
    };

    return <CirclePacking {...config} />;
  };

  export  const DemoCirclePackingNest = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antvdemo/assets/data/flare.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      autoFit: true,
      padding: 0,
      data,
      sizeField: 'r',
      // 自定义颜色
      colorField: 'r',
      color: 'rgb(252, 253, 191)-rgb(231, 82, 99)-rgb(183, 55, 121)',
      // 自定义样式
      pointStyle: {
        stroke: 'rgb(183, 55, 121)',
        lineWidth: 0.5,
      },
      label: false,
      legend: false,
      drilldown: {
        enabled: true,
        breadCrumb: {
          position: 'top-left',
        },
      },
    };

    return <CirclePacking {...config} />;
  };

  export  const DemoCirclePackingDisplaylabel = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antfincdn/%24m0nDoQYqH/basic-packing.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      autoFit: true,
      padding: 0,
      data,
      sizeField: 'r',
      color: 'rgb(252, 253, 191)-rgb(231, 82, 99)-rgb(183, 55, 121)',
      // 自定义 label 样式
      label: {
        formatter: ({ name }) => {
          return name !== 'root' ? name : '';
        },
        // 偏移
        offsetY: 8,
        style: {
          fontSize: 12,
          textAlign: 'center',
          fill: 'rgba(0,0,0,0.65)',
        },
      },
      legend: false,
    };

    return <CirclePacking {...config} />;
  };

  export  const DemoCirclePackingCustom = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antfincdn/%24m0nDoQYqH/basic-packing.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      autoFit: true,
      padding: 0,
      data,
      hierarchyConfig: {
        padding: 0.01,
      },
      color: 'rgb(252, 253, 191)-rgb(231, 82, 99)-rgb(183, 55, 121)',
      // 自定义 label 样式
      label: false,
      legend: false,
    };

    return <CirclePacking {...config} />;
  };

  export  const DemoVennBasic = () => {
    const config = {
      data: [
        {
          sets: ['A'],
          size: 12,
          label: 'A',
        },
        {
          sets: ['B'],
          size: 12,
          label: 'B',
        },
        {
          sets: ['C'],
          size: 12,
          label: 'C',
        },
        {
          sets: ['A', 'B'],
          size: 2,
          label: 'A&B',
        },
        {
          sets: ['A', 'C'],
          size: 2,
          label: 'A&C',
        },
        {
          sets: ['B', 'C'],
          size: 2,
          label: 'B&C',
        },
        {
          sets: ['A', 'B', 'C'],
          size: 1,
        },
      ],
      setsField: 'sets',
      sizeField: 'size',
      pointStyle: {
        fillOpacity: 0.85,
      },
    };
    return <Venn {...config} />;
  };

  export  const DemoVennColor = () => {
    const config = {
      data: [
        {
          sets: ['A'],
          size: 12,
          label: 'A',
        },
        {
          sets: ['B'],
          size: 12,
          label: 'B',
        },
        {
          sets: ['C'],
          size: 12,
          label: 'C',
        },
        {
          sets: ['A', 'B'],
          size: 2,
          label: 'A&B',
        },
        {
          sets: ['A', 'C'],
          size: 2,
          label: 'A&C',
        },
        {
          sets: ['B', 'C'],
          size: 2,
          label: 'B&C',
        },
        {
          sets: ['A', 'B', 'C'],
          size: 1,
        },
      ],
      setsField: 'sets',
      sizeField: 'size',
      // more blendMode to see: https://gka.github.io/chroma.js/#chroma-blend
      blendMode: 'overlay',
      pointStyle: {
        fillOpacity: 0.85,
      },
    };
    return <Venn {...config} />;
  };

  export  const DemoVennFormatterTooltip = () => {
    const config = {
      data: [
        {
          sets: ['A'],
          size: 12,
          label: 'A',
        },
        {
          sets: ['B'],
          size: 12,
          label: 'B',
        },
        {
          sets: ['C'],
          size: 12,
          label: 'C',
        },
        {
          sets: ['A', 'B'],
          size: 2,
          label: 'A&B',
        },
        {
          sets: ['A', 'C'],
          size: 2,
          label: 'A&C',
        },
        {
          sets: ['B', 'C'],
          size: 2,
          label: 'B&C',
        },
        {
          sets: ['A', 'B', 'C'],
          size: 1,
          label: 'A&B&C',
        },
      ],
      setsField: 'sets',
      sizeField: 'size',
      pointStyle: {
        fillOpacity: 0.85,
      },
      tooltip: {
        fields: ['label', 'size'],
        formatter: (datum) => {
          return {
            name: datum.label,
            value: datum.size,
          };
        },
      },
    };
    return <Venn {...config} />;
  };

  export  const DemoVennLabel = () => {
    const config = {
      data: [
        {
          sets: ['A'],
          size: 12,
          label: 'A',
        },
        {
          sets: ['B'],
          size: 12,
          label: 'B',
        },
        {
          sets: ['C'],
          size: 12,
          label: 'C',
        },
        {
          sets: ['A', 'B'],
          size: 2,
          label: 'A&B',
        },
        {
          sets: ['A', 'C'],
          size: 2,
          label: 'A&C',
        },
        {
          sets: ['B', 'C'],
          size: 2,
          label: 'B&C',
        },
        {
          sets: ['A', 'B', 'C'],
          size: 1,
          label: 'A&B&C',
        },
      ],
      setsField: 'sets',
      sizeField: 'size',
      pointStyle: {
        fillOpacity: 0.85,
      },
      label: {
        offsetY: 7,
        style: {
          fontSize: 14,
        },
        formatter: (datum) => `${datum.sets.join('&')}: ${datum.size}`,
      },
    };
    return <Venn {...config} />;
  };

  export const DemoVennCustomize = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/bmw-prod/c4c17fe9-0a93-4255-bc1e-1ff84966d24a.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const sum = data.reduce((a, b) => a + b.size, 0);

    const toPercent = (p) => `${(p * 100).toFixed(2)}%`;

    const config = {
      setsField: 'sets',
      sizeField: 'size',
      data,
      pointStyle: {
        fillOpacity: 0.85,
      },
      color: ['#9DF5CA', '#61DDAA', '#42C090'],
      label: {
        style: {
          lineHeight: 18,
        },
        formatter: (datum) => {
          return datum.sets.length > 1
            ? `${datum.size} (${toPercent(datum.size / sum)})`
            : `${datum.id}\n${datum.size} (${toPercent(datum.size / sum)})`;
        },
      },
      tooltip: {
        fields: ['sets', 'size'],
        customContent: (title, items) => {
          const datum = items[0]?.data || {};
          const color = items[0]?.color;
          let listStr = '';

          if (datum['伙伴名称']?.length > 0) {
            datum['伙伴名称'].forEach((item, idx) => {
              listStr += `<div class="g2-tooltip-list-item">
                    <span class="g2-tooltip-name">${idx}. ${item}</span>
                </div>`;
            });
          }

          return `<div class="g2-tooltip-list">
              <div class="g2-tooltip-list-item">
                <span class="g2-tooltip-marker" style="background:${color}; width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 8px;"></span>
                <span class="g2-tooltip-name">${datum.sets?.join('&')}</span>
                <span class="g2-tooltip-value">${datum.size}</span>
              </div>
              ${listStr
              ? `<div class="g2-tooltip-list-item">
                <span class="g2-tooltip-name"><b>伙伴名称</b></span>
              </div>${listStr}`
              : ''
            }
            </div>`;
        },
      },
    };

    return <Venn {...config} />;
  };


  export const DemoVennElementAction = () => {
    const config = {
      data: [
        {
          sets: ['A'],
          size: 12,
          label: 'A',
        },
        {
          sets: ['B'],
          size: 12,
          label: 'B',
        },
        {
          sets: ['C'],
          size: 12,
          label: 'C',
        },
        {
          sets: ['A', 'B'],
          size: 2,
          label: 'A&B',
        },
        {
          sets: ['A', 'C'],
          size: 2,
          label: 'A&C',
        },
        {
          sets: ['B', 'C'],
          size: 2,
          label: 'B&C',
        },
        {
          sets: ['A', 'B', 'C'],
          size: 1,
        },
      ],
      setsField: 'sets',
      sizeField: 'size',
      pointStyle: {
        fillOpacity: 0.8,
      },
      padding: [0, 10],
      state: {
        active: {
          style: {
            fillOpacity: 1,
            stroke: 'black',
            lineWidth: 1,
          },
        },
        selected: {
          style: {
            stroke: 'black',
            lineWidth: 2,
          },
        },
      },
      interactions: [
        {
          type: 'venn-element-active',
          enable: true,
        },
        {
          type: 'venn-element-selected',
          enable: true,
        },
      ],
    };
    return <Venn {...config} />;
  };

  export const DemoStockBasic = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antfincdn/qtQ9nYfYJe/stock-data.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      xField: 'trade_date',
      yField: ['open', 'close', 'high', 'low'],
    };

    return <Stock {...config} />;
  };

  export const DemoStockCustom = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      asyncFetch();
    }, []);

    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/antfincdn/qtQ9nYfYJe/stock-data.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    };
    const config = {
      data,
      xField: 'trade_date',
      yField: ['open', 'close', 'high', 'low'],
      meta: {
        vol: {
          alias: '成交量',
        },
        open: {
          alias: '开盘价',
        },
        close: {
          alias: '收盘价',
        },
        high: {
          alias: '最高价',
        },
        low: {
          alias: '最低价',
        },
      },
      tooltip: {
        crosshairs: {
          // 自定义 crosshairs line 样式
          line: {
            style: {
              lineWidth: 0.5,
              stroke: 'rgba(0,0,0,0.25)',
            },
          },
          text: (type, defaultContent, items) => {
            let textContent;

            if (type === 'x') {
              const item = items[0];
              textContent = item ? item.title : defaultContent;
            } else {
              textContent = `${defaultContent.toFixed(2)}`;
            }

            return {
              position: type === 'y' ? 'start' : 'end',
              content: textContent,
              // 自定义 crosshairs text 样式
              style: {
                fill: '#dfdfdf',
              },
            };
          },
          // 自定义 crosshairs textBackground 样式
          textBackground: {
            padding: [4, 8],
            style: {
              fill: '#363636',
            },
          },
        },
      },
    };

    return <Stock {...config} />;
  };


export default DemoLineBasic;