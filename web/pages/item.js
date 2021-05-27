import Chart from "../components/chart";
const fetcher = (url) => fetch(url).then((res) => res.text());
const fetcherj = (url) => fetch(url).then((res) => res.json());
import { useRouter } from "next/router";
import { Box, Text, Image, Flex } from "@chakra-ui/react";
import useSWR from "swr";
import moment from "moment";
import Loading from "../components/loading";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import {
  VictoryChart,
  VictoryBar,
  VictoryPie,
  VictoryTheme,
  VictoryLabel,
  VictoryTooltip,
  VictoryGroup,
  VictoryArea,
} from "victory";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@chakra-ui/react";

function getdata(arr, time) {
  let i = arr.length - 1;
  const now = new Date();
  now.setDate(now.getDate() - time);
  while (new Date(arr[i][0]) > now) {
    i--;
  }
  const array = arr.slice(i, arr.length - 1);
  let o = [];
  for (let i = 0; i < array.length - 1; i++) {
    o.push({
      x: moment(array[i][0]).format("YYYY/MM/DD"),
      y: array[i][2],
    });
  }

  var newObj = {};
  for (i in o) {
    var item = o[i];
    if (newObj[item.x] === undefined) {
      newObj[item.x] = 0;
    }
    newObj[item.x] += parseInt(item.y);
  }

  var result = {};
  result = [];
  for (i in newObj) {
    result.push({ x: i, y: newObj[i] });
  }
  for (i in result) {
    result[i].x = new Date(result[i].x);
  }
  return result;
}
function steamcharts(data) {
  if (data != undefined) {
    var price;
    if (data.length > 365) {
      price = data.slice(data.length - 365);
    } else {
      price = data;
    }
    return (
      <>
        <Text fontSize="20px">近期交易次数</Text>
        <Box maxW="480px" mx="auto">
          <Tabs px="5" my="4" mx="auto" defaultIndex={1} align="end">
            <TabPanels>
              <TabPanel>
                <VictoryChart
                  width={400}
                  height={300}
                  domainPadding={10}
                  theme={VictoryTheme.material}
                >
                  <VictoryBar
                    style={{ data: { fill: "rgb(210,47,39)" } }}
                    data={getdata(price, 6)}
                    labels={({ datum }) =>
                      `${new Date(datum.x).toDateString()}有${datum.y}个订单`
                    }
                    labelComponent={<VictoryTooltip />}
                  />
                </VictoryChart>
              </TabPanel>
              <TabPanel>
                <VictoryChart
                  width={400}
                  height={300}
                  domainPadding={10}
                  theme={VictoryTheme.material}
                >
                  <VictoryBar
                    style={{ data: { fill: "rgb(210,47,39)" } }}
                    data={getdata(price, 30)}
                    labels={({ datum }) =>
                      `${new Date(datum.x).toDateString()}有${datum.y}个订单`
                    }
                    labelComponent={<VictoryTooltip />}
                  />
                </VictoryChart>
              </TabPanel>
            </TabPanels>
            <TabList>
              <Tab>周</Tab>
              <Tab>月</Tab>
            </TabList>
          </Tabs>
        </Box>
        <Text m="4" fontSize="20px">
          steam历史价格总览
        </Text>
        <Box className="chart" w="80%" maxW="480px" mx="auto">
          <Chart data1={price} data2={price} />
        </Box>
      </>
    );
  } else {
    return (
      <Box>
        <Text>暂无steam数据</Text>
      </Box>
    );
  }
}
function randomcolor() {
  return (
    "#" +
    Math.floor(Math.random() * 2 ** 24)
      .toString(16)
      .padStart(0, 6)
  );
}
export default function Item() {
  const router = useRouter();
  const path = router.query.id;
  const { data } = useSWR("/api/item?id=" + path, fetcherj);
  const { data: pricetext } = useSWR(
    () =>
      "https://api.scraperapi.com/?api_key=bd34bcd86583b46c76dc5c9c24c5af26&url=" +
      data.knifes[0].steam.href.substring(6),
    fetcher
  );
  if (!data || !pricetext) {
    return <Loading />;
  }
  const price = JSON.parse(pricetext.match(/\[\[(.*)\]\]/g)[0]);
  const info = data.knifes[0];
  let piedata = [];
  let c5_price = "unknown";
  let ig_price = "unknown";
  let steam_price = "unknown";
  let igchart = null;
  let c5chart = null;
  let steamchart = null;
  if (info.igxe) {
    piedata.push({ x: "igxe", y: parseInt(info.igxe.num) });
    ig_price = info.igxe.current_price;
    let igdata = [];
    for (let i = 0; i < info.igxe.prices.length; i++) {
      igdata.push({
        x: new Date(info.igxe.prices[i].date.replace(", ", "T")),
        y: parseInt(info.igxe.prices[i].price.substring(1)),
      });
    }
    igchart = (
      <VictoryArea
        style={{
          data: { fill: "rgb(29,74,138)", stroke: "rgb(29,74,138)" },
        }}
        data={igdata}
      />
    );
  }
  if (info.c5game) {
    piedata.push({ x: "c5", y: parseInt(info.c5game.num) });
    c5_price = info.c5game.current_price;
    let c5data = [];
    for (let i = 0; i < info.c5game.prices.length; i++) {
      c5data.push({
        x: new Date(info.c5game.prices[i].date.replace(", ", "T")),
        y: parseInt(info.c5game.prices[i].price.substring(1)),
      });
    }
    c5chart = (
      <VictoryArea
        style={{
          data: { fill: "rgb(14,43,94)", stroke: "rgb(14,43,94)" },
        }}
        data={c5data}
      />
    );
  }
  if (info.steam) {
    piedata.push({ x: "steam", y: parseInt(info.steam.num) });
    steam_price = info.steam.current_price;
    let steamdata = [];
    for (let i = 0; i < info.steam.prices.length; i++) {
      steamdata.push({
        x: new Date(info.steam.prices[i].date.replace(", ", "T")),
        y: 0.85 * 6.43 * parseInt(info.steam.prices[i].price.substring(1)),
      });
    }
    steamchart = (
      <VictoryArea
        style={{
          data: { fill: "rgb(45,105,194)", stroke: "rgb(45,105,194)" },
        }}
        data={steamdata}
      />
    );
  }
  return (
    <>
      <Breadcrumb mx="10" mt="10">
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">{data.knifes[0]._id}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <Box mx="auto" w="500px" maxW="100%" my="10">
        <Text
          bgGradient={`linear(to-l, ${randomcolor()},${randomcolor()})`}
          bgClip="text"
          fontSize="2xl"
          fontWeight="bold"
        >
          {info._id}
        </Text>
        <Image mx="auto" w="150px" src={"https://" + info.igxe.img} />
        <Flex direction="column" my="10">
          <Flex justify="center">
            <Image borderRadius="5" w="25px" src="/igxe.png" m="2" />
            igxe价格：{ig_price}
          </Flex>
          <Flex justify="center">
            <Image borderRadius="5" w="25px" src="/c5.jpg" m="2" />
            c5game价格：{c5_price}
          </Flex>
          <Flex justify="center">
            <Image borderRadius="5" w="25px" src="/steam.png" m="2" />
            steam价格：{steam_price}
          </Flex>
        </Flex>
      </Box>

      <Box w="300px" mx="auto">
        <svg viewBox="0 0 400 400">
          <VictoryPie
            standalone={false}
            colorScale={["tomato", "orange", "gold", "cyan", "navy"]}
            style={{ labels: { fill: "white" } }}
            innerRadius={70}
            labelRadius={95}
            labels={({ datum }) => `${datum.x}\n 在售${datum.y}`}
            data={piedata}
          />
          <VictoryLabel
            textAnchor="middle"
            style={{ fontSize: 20 }}
            x={200}
            y={200}
            text="sale!"
          />
        </svg>
      </Box>
      <Box w="360px" mx="auto">
        <VictoryChart
          domain={{
            y: [
              parseInt(data.knifes[0].igxe.current_price.substring(1)) * 0.9,
              parseInt(data.knifes[0].igxe.current_price.substring(1)) * 1.3,
            ],
          }}
          width={500}
          height={480}
        >
          <VictoryGroup
            style={{
              data: { strokeWidth: 1.5, fillOpacity: 0.45 },
            }}
          >
            {igchart}
            {steamchart}
            {c5chart}
          </VictoryGroup>
        </VictoryChart>
      </Box>
      {steamcharts(price)}
    </>
  );
}
