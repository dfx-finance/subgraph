// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Trade extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Trade entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Trade entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Trade", id.toString(), this);
  }

  static load(id: string): Trade | null {
    return store.get("Trade", id) as Trade | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get pair(): string {
    let value = this.get("pair");
    return value.toString();
  }

  set pair(value: string) {
    this.set("pair", Value.fromString(value));
  }

  get trader(): Bytes {
    let value = this.get("trader");
    return value.toBytes();
  }

  set trader(value: Bytes) {
    this.set("trader", Value.fromBytes(value));
  }

  get origin(): Bytes {
    let value = this.get("origin");
    return value.toBytes();
  }

  set origin(value: Bytes) {
    this.set("origin", Value.fromBytes(value));
  }

  get target(): Bytes {
    let value = this.get("target");
    return value.toBytes();
  }

  set target(value: Bytes) {
    this.set("target", Value.fromBytes(value));
  }

  get originAmount(): BigInt {
    let value = this.get("originAmount");
    return value.toBigInt();
  }

  set originAmount(value: BigInt) {
    this.set("originAmount", Value.fromBigInt(value));
  }

  get targetAmount(): BigInt {
    let value = this.get("targetAmount");
    return value.toBigInt();
  }

  set targetAmount(value: BigInt) {
    this.set("targetAmount", Value.fromBigInt(value));
  }
}

export class Transfer extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Transfer entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Transfer entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Transfer", id.toString(), this);
  }

  static load(id: string): Transfer | null {
    return store.get("Transfer", id) as Transfer | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get pair(): string {
    let value = this.get("pair");
    return value.toString();
  }

  set pair(value: string) {
    this.set("pair", Value.fromString(value));
  }

  get from(): Bytes {
    let value = this.get("from");
    return value.toBytes();
  }

  set from(value: Bytes) {
    this.set("from", Value.fromBytes(value));
  }

  get to(): Bytes {
    let value = this.get("to");
    return value.toBytes();
  }

  set to(value: Bytes) {
    this.set("to", Value.fromBytes(value));
  }

  get token0Amount(): BigDecimal {
    let value = this.get("token0Amount");
    return value.toBigDecimal();
  }

  set token0Amount(value: BigDecimal) {
    this.set("token0Amount", Value.fromBigDecimal(value));
  }

  get token1Amount(): BigDecimal {
    let value = this.get("token1Amount");
    return value.toBigDecimal();
  }

  set token1Amount(value: BigDecimal) {
    this.set("token1Amount", Value.fromBigDecimal(value));
  }

  get value(): BigInt {
    let value = this.get("value");
    return value.toBigInt();
  }

  set value(value: BigInt) {
    this.set("value", Value.fromBigInt(value));
  }

  get type(): string {
    let value = this.get("type");
    return value.toString();
  }

  set type(value: string) {
    this.set("type", Value.fromString(value));
  }
}

export class DFXFactory extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save DFXFactory entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save DFXFactory entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("DFXFactory", id.toString(), this);
  }

  static load(id: string): DFXFactory | null {
    return store.get("DFXFactory", id) as DFXFactory | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get pairCount(): i32 {
    let value = this.get("pairCount");
    return value.toI32();
  }

  set pairCount(value: i32) {
    this.set("pairCount", Value.fromI32(value));
  }

  get totalVolumeUSD(): BigDecimal {
    let value = this.get("totalVolumeUSD");
    return value.toBigDecimal();
  }

  set totalVolumeUSD(value: BigDecimal) {
    this.set("totalVolumeUSD", Value.fromBigDecimal(value));
  }

  get totalLiquidityUSD(): BigDecimal {
    let value = this.get("totalLiquidityUSD");
    return value.toBigDecimal();
  }

  set totalLiquidityUSD(value: BigDecimal) {
    this.set("totalLiquidityUSD", Value.fromBigDecimal(value));
  }
}

export class DFXDayData extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save DFXDayData entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save DFXDayData entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("DFXDayData", id.toString(), this);
  }

  static load(id: string): DFXDayData | null {
    return store.get("DFXDayData", id) as DFXDayData | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get date(): i32 {
    let value = this.get("date");
    return value.toI32();
  }

  set date(value: i32) {
    this.set("date", Value.fromI32(value));
  }

  get dailyVolumeUSD(): BigDecimal {
    let value = this.get("dailyVolumeUSD");
    return value.toBigDecimal();
  }

  set dailyVolumeUSD(value: BigDecimal) {
    this.set("dailyVolumeUSD", Value.fromBigDecimal(value));
  }

  get totalVolumeUSD(): BigDecimal {
    let value = this.get("totalVolumeUSD");
    return value.toBigDecimal();
  }

  set totalVolumeUSD(value: BigDecimal) {
    this.set("totalVolumeUSD", Value.fromBigDecimal(value));
  }

  get totalLiquidityUSD(): BigDecimal {
    let value = this.get("totalLiquidityUSD");
    return value.toBigDecimal();
  }

  set totalLiquidityUSD(value: BigDecimal) {
    this.set("totalLiquidityUSD", Value.fromBigDecimal(value));
  }
}

export class PairHourData extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save PairHourData entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save PairHourData entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("PairHourData", id.toString(), this);
  }

  static load(id: string): PairHourData | null {
    return store.get("PairHourData", id) as PairHourData | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get hourStartUnix(): i32 {
    let value = this.get("hourStartUnix");
    return value.toI32();
  }

  set hourStartUnix(value: i32) {
    this.set("hourStartUnix", Value.fromI32(value));
  }

  get pair(): string {
    let value = this.get("pair");
    return value.toString();
  }

  set pair(value: string) {
    this.set("pair", Value.fromString(value));
  }

  get firstTxn(): Bytes {
    let value = this.get("firstTxn");
    return value.toBytes();
  }

  set firstTxn(value: Bytes) {
    this.set("firstTxn", Value.fromBytes(value));
  }

  get reserve0(): BigDecimal {
    let value = this.get("reserve0");
    return value.toBigDecimal();
  }

  set reserve0(value: BigDecimal) {
    this.set("reserve0", Value.fromBigDecimal(value));
  }

  get reserve1(): BigDecimal {
    let value = this.get("reserve1");
    return value.toBigDecimal();
  }

  set reserve1(value: BigDecimal) {
    this.set("reserve1", Value.fromBigDecimal(value));
  }

  get reserveUSD(): BigDecimal {
    let value = this.get("reserveUSD");
    return value.toBigDecimal();
  }

  set reserveUSD(value: BigDecimal) {
    this.set("reserveUSD", Value.fromBigDecimal(value));
  }

  get swapRateUSD(): BigDecimal {
    let value = this.get("swapRateUSD");
    return value.toBigDecimal();
  }

  set swapRateUSD(value: BigDecimal) {
    this.set("swapRateUSD", Value.fromBigDecimal(value));
  }

  get volumeToken0(): BigDecimal {
    let value = this.get("volumeToken0");
    return value.toBigDecimal();
  }

  set volumeToken0(value: BigDecimal) {
    this.set("volumeToken0", Value.fromBigDecimal(value));
  }

  get volumeToken1(): BigDecimal {
    let value = this.get("volumeToken1");
    return value.toBigDecimal();
  }

  set volumeToken1(value: BigDecimal) {
    this.set("volumeToken1", Value.fromBigDecimal(value));
  }

  get volumeUSD(): BigDecimal {
    let value = this.get("volumeUSD");
    return value.toBigDecimal();
  }

  set volumeUSD(value: BigDecimal) {
    this.set("volumeUSD", Value.fromBigDecimal(value));
  }

  get participantCount(): BigInt {
    let value = this.get("participantCount");
    return value.toBigInt();
  }

  set participantCount(value: BigInt) {
    this.set("participantCount", Value.fromBigInt(value));
  }
}

export class PairDayData extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save PairDayData entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save PairDayData entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("PairDayData", id.toString(), this);
  }

  static load(id: string): PairDayData | null {
    return store.get("PairDayData", id) as PairDayData | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get date(): i32 {
    let value = this.get("date");
    return value.toI32();
  }

  set date(value: i32) {
    this.set("date", Value.fromI32(value));
  }

  get pair(): string {
    let value = this.get("pair");
    return value.toString();
  }

  set pair(value: string) {
    this.set("pair", Value.fromString(value));
  }

  get firstTxn(): Bytes {
    let value = this.get("firstTxn");
    return value.toBytes();
  }

  set firstTxn(value: Bytes) {
    this.set("firstTxn", Value.fromBytes(value));
  }

  get reserve0(): BigDecimal {
    let value = this.get("reserve0");
    return value.toBigDecimal();
  }

  set reserve0(value: BigDecimal) {
    this.set("reserve0", Value.fromBigDecimal(value));
  }

  get reserve1(): BigDecimal {
    let value = this.get("reserve1");
    return value.toBigDecimal();
  }

  set reserve1(value: BigDecimal) {
    this.set("reserve1", Value.fromBigDecimal(value));
  }

  get reserveUSD(): BigDecimal {
    let value = this.get("reserveUSD");
    return value.toBigDecimal();
  }

  set reserveUSD(value: BigDecimal) {
    this.set("reserveUSD", Value.fromBigDecimal(value));
  }

  get swapRateUSD(): BigDecimal {
    let value = this.get("swapRateUSD");
    return value.toBigDecimal();
  }

  set swapRateUSD(value: BigDecimal) {
    this.set("swapRateUSD", Value.fromBigDecimal(value));
  }

  get volumeToken0(): BigDecimal {
    let value = this.get("volumeToken0");
    return value.toBigDecimal();
  }

  set volumeToken0(value: BigDecimal) {
    this.set("volumeToken0", Value.fromBigDecimal(value));
  }

  get volumeToken1(): BigDecimal {
    let value = this.get("volumeToken1");
    return value.toBigDecimal();
  }

  set volumeToken1(value: BigDecimal) {
    this.set("volumeToken1", Value.fromBigDecimal(value));
  }

  get volumeUSD(): BigDecimal {
    let value = this.get("volumeUSD");
    return value.toBigDecimal();
  }

  set volumeUSD(value: BigDecimal) {
    this.set("volumeUSD", Value.fromBigDecimal(value));
  }

  get participantCount(): BigInt {
    let value = this.get("participantCount");
    return value.toBigInt();
  }

  set participantCount(value: BigInt) {
    this.set("participantCount", Value.fromBigInt(value));
  }
}

export class Pair extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Pair entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Pair entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Pair", id.toString(), this);
  }

  static load(id: string): Pair | null {
    return store.get("Pair", id) as Pair | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get token0(): string {
    let value = this.get("token0");
    return value.toString();
  }

  set token0(value: string) {
    this.set("token0", Value.fromString(value));
  }

  get token1(): string {
    let value = this.get("token1");
    return value.toString();
  }

  set token1(value: string) {
    this.set("token1", Value.fromString(value));
  }

  get reserve0(): BigDecimal {
    let value = this.get("reserve0");
    return value.toBigDecimal();
  }

  set reserve0(value: BigDecimal) {
    this.set("reserve0", Value.fromBigDecimal(value));
  }

  get reserve1(): BigDecimal {
    let value = this.get("reserve1");
    return value.toBigDecimal();
  }

  set reserve1(value: BigDecimal) {
    this.set("reserve1", Value.fromBigDecimal(value));
  }

  get reserveUSD(): BigDecimal {
    let value = this.get("reserveUSD");
    return value.toBigDecimal();
  }

  set reserveUSD(value: BigDecimal) {
    this.set("reserveUSD", Value.fromBigDecimal(value));
  }

  get swapRateUSD(): BigDecimal {
    let value = this.get("swapRateUSD");
    return value.toBigDecimal();
  }

  set swapRateUSD(value: BigDecimal) {
    this.set("swapRateUSD", Value.fromBigDecimal(value));
  }

  get rewardsForDuration(): BigDecimal {
    let value = this.get("rewardsForDuration");
    return value.toBigDecimal();
  }

  set rewardsForDuration(value: BigDecimal) {
    this.set("rewardsForDuration", Value.fromBigDecimal(value));
  }

  get rewardDuration(): BigInt {
    let value = this.get("rewardDuration");
    return value.toBigInt();
  }

  set rewardDuration(value: BigInt) {
    this.set("rewardDuration", Value.fromBigInt(value));
  }

  get totalStaked(): BigDecimal {
    let value = this.get("totalStaked");
    return value.toBigDecimal();
  }

  set totalStaked(value: BigDecimal) {
    this.set("totalStaked", Value.fromBigDecimal(value));
  }

  get volumeToken0(): BigDecimal {
    let value = this.get("volumeToken0");
    return value.toBigDecimal();
  }

  set volumeToken0(value: BigDecimal) {
    this.set("volumeToken0", Value.fromBigDecimal(value));
  }

  get volumeToken1(): BigDecimal {
    let value = this.get("volumeToken1");
    return value.toBigDecimal();
  }

  set volumeToken1(value: BigDecimal) {
    this.set("volumeToken1", Value.fromBigDecimal(value));
  }

  get volumeUSD(): BigDecimal {
    let value = this.get("volumeUSD");
    return value.toBigDecimal();
  }

  set volumeUSD(value: BigDecimal) {
    this.set("volumeUSD", Value.fromBigDecimal(value));
  }

  get txnsCount(): BigInt {
    let value = this.get("txnsCount");
    return value.toBigInt();
  }

  set txnsCount(value: BigInt) {
    this.set("txnsCount", Value.fromBigInt(value));
  }

  get participantCount(): BigInt {
    let value = this.get("participantCount");
    return value.toBigInt();
  }

  set participantCount(value: BigInt) {
    this.set("participantCount", Value.fromBigInt(value));
  }

  get totalLPToken(): BigDecimal {
    let value = this.get("totalLPToken");
    return value.toBigDecimal();
  }

  set totalLPToken(value: BigDecimal) {
    this.set("totalLPToken", Value.fromBigDecimal(value));
  }

  get hourData(): Array<string> {
    let value = this.get("hourData");
    return value.toStringArray();
  }

  set hourData(value: Array<string>) {
    this.set("hourData", Value.fromStringArray(value));
  }
}

export class Token extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Token entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Token entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Token", id.toString(), this);
  }

  static load(id: string): Token | null {
    return store.get("Token", id) as Token | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get decimals(): BigInt {
    let value = this.get("decimals");
    return value.toBigInt();
  }

  set decimals(value: BigInt) {
    this.set("decimals", Value.fromBigInt(value));
  }

  get symbol(): string {
    let value = this.get("symbol");
    return value.toString();
  }

  set symbol(value: string) {
    this.set("symbol", Value.fromString(value));
  }

  get name(): string {
    let value = this.get("name");
    return value.toString();
  }

  set name(value: string) {
    this.set("name", Value.fromString(value));
  }

  get priceUSD(): BigDecimal {
    let value = this.get("priceUSD");
    return value.toBigDecimal();
  }

  set priceUSD(value: BigDecimal) {
    this.set("priceUSD", Value.fromBigDecimal(value));
  }

  get tokenDayData(): Array<string> {
    let value = this.get("tokenDayData");
    return value.toStringArray();
  }

  set tokenDayData(value: Array<string>) {
    this.set("tokenDayData", Value.fromStringArray(value));
  }
}

export class TokenDayData extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save TokenDayData entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save TokenDayData entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("TokenDayData", id.toString(), this);
  }

  static load(id: string): TokenDayData | null {
    return store.get("TokenDayData", id) as TokenDayData | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get date(): i32 {
    let value = this.get("date");
    return value.toI32();
  }

  set date(value: i32) {
    this.set("date", Value.fromI32(value));
  }

  get token(): string | null {
    let value = this.get("token");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set token(value: string | null) {
    if (value === null) {
      this.unset("token");
    } else {
      this.set("token", Value.fromString(value as string));
    }
  }

  get dailyVolumeToken(): BigDecimal {
    let value = this.get("dailyVolumeToken");
    return value.toBigDecimal();
  }

  set dailyVolumeToken(value: BigDecimal) {
    this.set("dailyVolumeToken", Value.fromBigDecimal(value));
  }

  get dailyVolumeUSD(): BigDecimal {
    let value = this.get("dailyVolumeUSD");
    return value.toBigDecimal();
  }

  set dailyVolumeUSD(value: BigDecimal) {
    this.set("dailyVolumeUSD", Value.fromBigDecimal(value));
  }

  get priceUSD(): BigDecimal {
    let value = this.get("priceUSD");
    return value.toBigDecimal();
  }

  set priceUSD(value: BigDecimal) {
    this.set("priceUSD", Value.fromBigDecimal(value));
  }
}

export class PoolParticipant extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save PoolParticipant entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save PoolParticipant entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("PoolParticipant", id.toString(), this);
  }

  static load(id: string): PoolParticipant | null {
    return store.get("PoolParticipant", id) as PoolParticipant | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get pair(): string {
    let value = this.get("pair");
    return value.toString();
  }

  set pair(value: string) {
    this.set("pair", Value.fromString(value));
  }

  get participant(): Bytes {
    let value = this.get("participant");
    return value.toBytes();
  }

  set participant(value: Bytes) {
    this.set("participant", Value.fromBytes(value));
  }

  get volumeUSD(): BigDecimal {
    let value = this.get("volumeUSD");
    return value.toBigDecimal();
  }

  set volumeUSD(value: BigDecimal) {
    this.set("volumeUSD", Value.fromBigDecimal(value));
  }

  get liquidityProvided(): BigDecimal {
    let value = this.get("liquidityProvided");
    return value.toBigDecimal();
  }

  set liquidityProvided(value: BigDecimal) {
    this.set("liquidityProvided", Value.fromBigDecimal(value));
  }
}
