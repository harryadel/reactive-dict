import { Tracker } from 'standalone-tracker';

const { ReactiveDict } = require('../src/reactive-dict');

test('ReactiveDict - set to undefined', () => {
  const dict = new ReactiveDict();
  dict.set('foo', undefined);
  expect(Object.keys(dict.all())).toEqual(['foo']);
  dict.setDefault('foo', 'bar');
  expect(dict.get('foo')).toEqual(undefined);
});

test('ReactiveDict - initialize with data', () => {
  const now = new Date();
  let dict = new ReactiveDict({
    now,
  });

  let nowFromDict = dict.get('now');
  expect(nowFromDict).toEqual(now);

  // Test with static value here as a named dict could
  // be migrated if code reload happens while testing
  dict = new ReactiveDict('foo', {
    foo: 'bar',
  });

  nowFromDict = dict.get('foo');
  expect(nowFromDict).toEqual('bar');

  dict = new ReactiveDict(undefined, {
    now,
  });

  nowFromDict = dict.get('now');
  expect(nowFromDict).toEqual(now);
});

test('ReactiveDict - setDefault', () => {
  let dict = new ReactiveDict();
  dict.set('A', 'blah');
  dict.set('B', undefined);
  dict.setDefault('A', 'default');
  dict.setDefault('B', 'default');
  dict.setDefault('C', 'default');
  dict.setDefault('D', undefined);
  expect(dict.all()).toEqual({
    A: 'blah',
    B: undefined,
    C: 'default',
    D: undefined,
  });

  dict = new ReactiveDict();
  dict.set('A', 'blah');
  dict.set('B', undefined);
  dict.setDefault({
    A: 'default',
    B: 'defualt',
    C: 'default',
    D: undefined,
  });
  expect(dict.all()).toEqual({
    A: 'blah',
    B: undefined,
    C: 'default',
    D: undefined,
  });
});

test('ReactiveDict - all() works', () => {
  let all = {};
  const dict = new ReactiveDict();
  Tracker.autorun(() => {
    all = dict.all();
  });

  expect(all).toEqual({});

  dict.set('foo', 'bar');
  Tracker.flush();
  expect(all).toEqual({ foo: 'bar' });

  dict.set('blah', undefined);
  Tracker.flush();
  expect(all).toEqual({ foo: 'bar', blah: undefined });
});

test('ReactiveDict - clear() works', () => {
  const dict = new ReactiveDict();
  dict.set('foo', 'bar');

  // Clear should not throw an error now
  // See issue #5530
  dict.clear();

  dict.set('foo', 'bar');

  let val;
  let equals;
  let equalsUndefined;
  let all;
  Tracker.autorun(() => {
    val = dict.get('foo');
  });
  Tracker.autorun(() => {
    equals = dict.equals('foo', 'bar');
  });
  Tracker.autorun(() => {
    equalsUndefined = dict.equals('foo', undefined);
  });
  Tracker.autorun(() => {
    all = dict.all();
  });

  expect(val).toEqual('bar');
  expect(equals).toEqual(true);
  expect(equalsUndefined).toEqual(false);
  expect(all).toEqual({ foo: 'bar' });

  dict.clear();
  Tracker.flush();
  expect(val).toBeUndefined();
  expect(equals).toEqual(false);
  expect(equalsUndefined).toEqual(true);
  expect(all).toEqual({});
});

test('ReactiveDict - delete(key) works', () => {
  const dict = new ReactiveDict();
  dict.set('foo', 'bar');
  dict.set('bar', 'foo');

  dict.set('baz', 123);
  expect(dict.delete('baz')).toEqual(true);
  expect(dict.delete('baz')).toEqual(false);

  let val;
  let equals;
  let equalsUndefined;
  let all;

  Tracker.autorun(() => {
    val = dict.get('foo');
  });
  Tracker.autorun(() => {
    equals = dict.equals('foo', 'bar');
  });
  Tracker.autorun(() => {
    equalsUndefined = dict.equals('foo', undefined);
  });
  Tracker.autorun(() => {
    all = dict.all();
  });

  expect(val).toEqual('bar');
  expect(equals).toEqual(true);
  expect(equalsUndefined).toEqual(false);
  expect(all).toEqual({ foo: 'bar', bar: 'foo' });

  let didRemove = dict.delete('foo');
  expect(didRemove).toEqual(true);

  Tracker.flush();

  expect(val).toBeUndefined();
  expect(equals).toEqual(false);
  expect(equalsUndefined).toEqual(true);
  expect(all).toEqual({ bar: 'foo' });

  didRemove = dict.delete('barfoobar');
  expect(didRemove).toEqual(false);
});

test('ReactiveDict - destroy works', () => {
  let dict = new ReactiveDict('test');

  // Should throw on client when reload package is present
  // typeof window === 'object' && expect(() => {
  //   var dict2 = new ReactiveDict('test');
  // }).toThrow();

  dict.set('foo', 'bar');

  let val;
  let equals;
  let equalsUndefined;
  let all;
  Tracker.autorun(() => {
    val = dict.get('foo');
  });
  Tracker.autorun(() => {
    equals = dict.equals('foo', 'bar');
  });
  Tracker.autorun(() => {
    equalsUndefined = dict.equals('foo', undefined);
  });
  Tracker.autorun(() => {
    all = dict.all();
  });

  expect(val).toEqual('bar');
  expect(equals).toEqual(true);
  expect(equalsUndefined).toEqual(false);
  expect(all).toEqual({ foo: 'bar' });

  // .destroy() should clear the dict
  dict.destroy();
  Tracker.flush();
  expect(val).toBeUndefined();
  expect(equals).toEqual(false);
  expect(equalsUndefined).toEqual(true);
  expect(all).toEqual({});

  // Shouldn't throw now that we've destroyed the previous dict
  dict = new ReactiveDict('test');
});
