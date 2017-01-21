import Rx from 'rxjs/Rx';

const tasks = [{
  user_id: 1,
  completed: true,
  name: 'martin'
},
{
  user_id: 2,
  completed: true,
  name: 'martin'
},
{
  user_id: 9,
  completed: false,
  name: 'john'
}];

/**
 Here we execute the stream, the do operator is vital here.
 Maybe what might be easiest is to build an array of tuples,
 which contains the operator name and value after the operator.
 eg.

 [{
  operator: map, //this will dictate what will be drawn for the stream.
  value: res // this is the returned value for the operator
}]
**/
export function addOperatorToStream(stream, operator) {
  const { operatorId } = operator;
  switch (operatorId) {
    case 'MapOperator' : {
      const mapper = stream
      .map(operator.funcToApply)
      .do((x) => console.log(x));
      return mapper;
    }
    case 'FilterOperator' : {
      const filterer = stream
      .filter(operator.funcToApply)
      .do((x) => console.log(x));
      return filterer;
    }
    default: return stream;
  }
}


export function buildRxStream(streamMap = {}) {
  let streamToBuild = Rx.Observable.from(streamMap.data);
  streamMap.operators.forEach((operator) => {
    streamToBuild = addOperatorToStream(streamToBuild, operator);
  });
  return streamToBuild;
}


export function getFuncToApply(operator) {
  const hasProperty = (prop) => Object.prototype.hasOwnProperty.call(operator, prop);
  if (operator) {
    if (hasProperty('project')) {
      return operator.project;
    }
    if (hasProperty('predicate')) {
      return operator.predicate;
    }
  }
  return undefined;
}

export function locateOperators(stream, builder = { operators: [] }) {
  if (stream) {
    if (stream.operator) {
      builder.operators.push({
        operatorId: stream.operator.constructor.name,
        funcToApply: getFuncToApply(stream.operator),
      });
      return locateOperators(stream.source, builder);
    }
  }
  return {
    operators: builder.operators.reverse(),
    data: stream.array,
  };
}

export function debugStream(stream) {
  const operatorsWithData = locateOperators(stream);
  const res = buildRxStream(operatorsWithData);
  res.subscribe((x) => console.log(x));
  return stream;
}

export default function testy() {
  // const userId = 9; INvestigate this !!!!!
  const taskStream = Rx.Observable.from(tasks);
  const getCompletedUser = taskStream.filter((task) => !task.completed)
    .map((task) => task.name);
  debugStream(getCompletedUser); // TODO Update this to take an object with a second param which is the data we want to observe.
  getCompletedUser.subscribe((x) => console.log(x));

  return null;
}
