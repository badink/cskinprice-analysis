import useSWR from "swr";
import Chart from "../components/chart";
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
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Stack,
} from "@chakra-ui/react";
import moment from "moment";
import {
  Box,
  Tabs,
  TabPanels,
  TabPanel,
  TabList,
  Tab,
  Text,
} from "@chakra-ui/react";
const fetcher = (url) => fetch(url).then((res) => res.text());
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
      x: moment(array[i][0]).format("YYYY-MM-DD"),
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
export default function Steam({ url }) {
  if (!url)
    url =
      "https://api.scraperapi.com/?api_key=1bc0464cf07c3967eb9a9225c444753d&url=https://steamcommunity.com/market/listings/730/%E2%98%85%20Bayonet%20%7C%20Fade%20%28Factory%20New%29";
  const { data: odata } = useSWR(url, fetcher);
  if (!odata) {
    return (
      <Stack w="80%" mx="auto" my="150px">
        <Text fontSize="20px">Loading steam charts...</Text>
        <SkeletonText mt="6" noOfLines={6} spacing="4" />
      </Stack>
    );
  } else {
    const data = JSON.parse(odata.match(/\[\[(.*)\]\]/g)[0]);
    var price;
    if (data.length > 365) {
      price = data.slice(data.length - 365);
    } else {
      price = data;
    }
    return (
      <>
        <Box
          w="360px"
          color="red.200"
          className="pattern-checks-md green h-5"
          p="2"
          mx="auto"
        >
          {" "}
          <Text color="red.600" fontWeight="bold" fontSize="20px">
            Steam数据
          </Text>
        </Box>

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
        <Box
          w="360px"
          color="orange.200"
          className="pattern-checks-md h-5"
          p="2"
          mx="auto"
        >
          {" "}
          <Text color="orange.500" fontWeight="bold" fontSize="20px">
            Steam历史价格总览
          </Text>
        </Box>

        <Chart data1={price} />
      </>
    );
  }
}
