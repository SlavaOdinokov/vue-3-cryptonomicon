<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700"
              >Тикер</label
            >
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                v-model="ticker"
                @keydown.enter="add"
                @input="search"
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="Например DOGE"
              />
            </div>
            <div v-if="inputLines.length" class="flex bg-white p-1 rounded-md shadow-md flex-wrap">
              <span
                v-for="(str, idx) in inputLines"
                :key="idx"
                @click="addStr(str)"
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                {{ str }}
              </span>
            </div>
            <div v-if="errors.length" class="text-sm text-red-600">
              {{ errors[0] }}
            </div>
          </div>
        </div>
        <button
          @click="add"
          type="button"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <!-- Heroicon name: solid/mail -->
          <svg
            class="-ml-0.5 mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path
              d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            ></path>
          </svg>
          Добавить
        </button>
      </section>

      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div>
          <button
            v-if="currentPage > 1"
            @click="currentPage = currentPage - 1"
            class="mr-2 my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Назад
          </button>
          <button
            v-if="hasNextPage"
            @click="currentPage = currentPage + 1"
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Вперед
          </button>
          <div>
            Фильтр:
            <input
              v-model="filter"
              type="text"
              class="mr-4 block pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            />
          </div>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="(t, i) in paginatedTickers"
            :key="i"
            @click="select(t)"
            :class="{ 'border-4': selected === t }"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(+t.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="handleDelete(t)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>

      <section v-if="selected" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selected.name }} - USD
        </h3>
        <div 
          ref="graphTemplate"
          class="flex items-end border-gray-600 border-b border-l h-64"
        >
          <div
            v-for="(bar, idx) in normalizedGraph"
            :key="idx"
            class="bg-purple-800 border"
            :style="{ height: `${bar}%`, width: `${widthOneElementGraph}px` }"
          ></div>
        </div>
        <button
          @click="selected = null"
          type="button"
          class="absolute top-0 right-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:svgjs="http://svgjs.com/svgjs"
            version="1.1"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            style="enable-background: new 0 0 512 512"
            xml:space="preserve"
          >
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"
              ></path>
            </g>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>

// [x] 6. Наличие в состоянии ЗАВИСИМЫХ ДАННЫХ | Критичность: 5+
// [x] 4. Запросы напрямую внутри компонента (???) | Критичность: 5
// [x] 2. При удалении остается подписка на загрузку тикера | Критичность: 5
// [H] 5. Обработка ошибок API | Критичность: 5
// [x] 3. Количество запросов | Критичность: 4
// [x] 8. При удалении тикера не изменяется localStorage | Критичность: 4
// [x] 1. Одинаковый код в watch | Критичность: 3
// [ ] 9. localStorage и анонимные вкладки | Критичность: 3
// [x] 7. График ужасно выглядит если будет много цен | Критичность: 2
// [ ] 10. Магические строки и числа (URL, 5000 миллисекунд задержки, ключ локал стораджа, количество на странице) |  Критичность: 1

// Параллельно
// [x] График сломан если везде одинаковые значения
// [x] При удалении тикера остается выбор

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from "vue";
import { loadAllTickers, subscribeToTicker, unsubscribeFromTicker } from './api';

// data
const ticker = ref("");
const selected = ref(null);
const tickers = ref([]);
const errors = ref([]);
// data pagination
const currentPage = ref(1);
// data filter
const filter = ref("");
// data autocomplete
const allSymbols = ref([]);
const inputLines = ref([]);
// data graph
const graph = ref([]);
const maxGraphElements = ref(0);
const graphTemplate = ref(null); // $ref
const widthOneElementGraph = 20;

// computed
const hasNextPage = computed(() => filteredTickers.value.length > endIndex.value);
const startIndex = computed(() => (currentPage.value - 1) * 6);
const endIndex = computed(() => currentPage.value * 6);

const filteredTickers = computed(() => {
  return tickers.value.filter((ticker) =>
    ticker.name.includes(filter.value)
  );
});

const paginatedTickers = computed(() => {
  return filteredTickers.value.slice(startIndex.value, endIndex.value)
});

const normalizedGraph = computed(() => {
  const maxValue = Math.max(...graph.value);
  const minValue = Math.min(...graph.value);

  if (minValue === maxValue) {
    return graph.value.map(() => 50)
  }

  return graph.value.map(
    (price) => 5 + ((price - minValue) * 95) / (maxValue - minValue)
  );
});

const pageStateOptions = computed(() => {
  return {
    filter: filter.value,
    currentPage: currentPage.value
  }
});

// watch
watch(tickers, () => {
  localStorage.setItem("cryptonomicon-list", JSON.stringify(tickers.value));
});

watch(selected, () => {
  graph.value = [];
  nextTick(() => {
    calculateMaxGraphElements();
  });
});

watch(ticker, () => {
  errors.value = [];
});

watch(filter, () => {
  currentPage.value = 1;
});

watch(pageStateOptions, (val) => {
  const { pathname } = window.location;
  history.pushState(
    null,
    document.title,
    `${pathname}?filter=${val.filter}&page=${val.currentPage}`
  );
});

watch(paginatedTickers, () => {
  if (paginatedTickers.value.length === 0 && currentPage.value > 1) {
    currentPage.value -= 1;
  }
});

// methods
const calculateMaxGraphElements = () => {
  if (!graphTemplate.value) {
    return;
  }

  // console.log(graphTemplate.value.clientWidth);
  maxGraphElements.value = graphTemplate.value.clientWidth / widthOneElementGraph;
};

const formatPrice = (price) => {
  if (price === '-') {
    return price;
  }
  return price > 1 ? price.toFixed(2) : price.toPrecision(2);
};

const updateTicker = (tickerName, price) => {
  tickers.value.filter(t => t.name === tickerName).forEach(t => {
    if (selected.value && selected.value === t) {
      graph.value.push(price);

      // if (maxGraphElements.value === 0) {
      //   maxGraphElements.value = graphTemplate.value.clientWidth / widthOneElementGraph;
      // }

      while (graph.value.length > maxGraphElements.value) {
        graph.value.shift();
      }
    }
    t.price = price
  });
};

// const updateTickers = async () => {
  // if (!tickers.value.length) {
  //   return;
  // }

  // const data = await loadTickers(tickers.value.map(t => t.name));

  // tickers.value.forEach(ticker => {
  //   const price = data[ticker.name.toUpperCase()];
  //   ticker.price = price ?? '-';
  // })

  // if (selected.value && selected.value.name === tickerName) {
  //   graph.value.push(data.USD);
  // }
// };

const search = () => {
  if (ticker.value !== '') {
    const arr = allSymbols.value.filter(s => {
      return (s + '').indexOf(ticker.value.toUpperCase()) != -1;
    });
    inputLines.value = arr.sort((a, b) => a.localeCompare(b)).slice(0, 4);
  } else {
    inputLines.value = [];
  }
};

const addStr = (str) => {
  ticker.value = str;
  add();
};

const add = () => {
  if (ticker.value !== "") {
    const currentTicker = {
      name: ticker.value.toUpperCase(),
      price: "-",
    };

    const hasTicker = tickers.value.some(
      (ticker) => ticker.name === currentTicker.name
    );

    if (hasTicker) {
      errors.value.push("Такой тикер уже добавлен");
    } else {
      tickers.value = [...tickers.value, currentTicker];
      filter.value = "";
      ticker.value = "";
      inputLines.value = [];
      subscribeToTicker(currentTicker.name, (newPrice) => updateTicker(currentTicker.name, newPrice));
    }
  }
};

const select = (ticker) => {
  selected.value = ticker;
};

const handleDelete = (ticker) => {
  if (ticker === selected.value) {
    selected.value = null;
  }
  tickers.value = tickers.value.filter((item) => item !== ticker);
  unsubscribeFromTicker(ticker.name);
};

// hooks
onMounted(async () => {
  allSymbols.value = await loadAllTickers();
  const windowData = Object.fromEntries(
    new URL(window.location).searchParams.entries()
  );
  const tickersData = localStorage.getItem("cryptonomicon-list");

  if (windowData.filter) {
    filter.value = windowData.filter;
  }

  if (windowData.page) {
    currentPage.value = +windowData.page;
  }

  if (tickersData) {
    tickers.value = JSON.parse(tickersData);
    tickers.value.forEach(t => {
      subscribeToTicker(t.name, (newPrice) => updateTicker(t.name, newPrice));
    });
  }

  // setInterval(updateTickers, 5000);

  // подписываемся на изменение ширины экрана для корректного отображения графика
  window.addEventListener('resize', calculateMaxGraphElements);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', calculateMaxGraphElements);
});
</script>

<style></style>
