const Nutz = artifacts.require('./Nutz.sol');
const Power = artifacts.require('./Power.sol');
require('./helpers/transactionMined.js');

contract('Power', (accounts) => {

  // it('should init contract', async () => {
  //   const token = await Nutz.new(accounts[0], 0);
  //   const power = await Power.new(token.address, 1, 1000);
  //   const max = await power.maxPower.call();
  //   assert.equal(max.toNumber(), 100, 'maxPower wasn\'t initialized');
  //   const outstanding = await power.balanceOf.call(token.address);
  //   assert.equal(outstanding.toNumber(), 1000, 'outstanding shares haven\'t been initialized');
  // });

  it("should allow to power up and power down.", async () => {
    const downtime = 12*7*24*3600; // 3 month
    const benefitiary = accounts[1];
    const token = await Nutz.new(downtime);
    await token.moveCeiling(100);
    const powerAddr = await token.powerAddr.call();
    const power = Power.at(powerAddr);
    await token.approve(powerAddr, 10000);
    
    // get some tokens
    let txHash = web3.eth.sendTransaction({ gas: 200000, from: accounts[0], to: token.address, value: 10000000 });
    await web3.eth.transactionMined(txHash);

    // powerup these tokens and check shares
    await token.transfer(power.address, 200);
    let powBal = await power.balanceOf.call(accounts[0]);
    assert.equal(powBal.toNumber(), 20, 'power up failed');

    // power up some tokens with other account
    txHash = web3.eth.sendTransaction({ gas: 200000, from: accounts[3], to: token.address, value: 10000000 });
    await web3.eth.transactionMined(txHash);
    
    await token.transfer(power.address, 400, {from: accounts[3]});
    let ntzAddr = await power.nutzAddr.call();
    console.log(ntzAddr, token.address);
    powBal = await power.balanceOf.call(accounts[3]);
    console.log(powBal);
    // power down and check
    await power.transfer(token.address, 11);
    console.log('here');
    await power.downTickTest(0, (Date.now() / 1000 | 0) + downtime);
    powBal = await power.balanceOf.call(accounts[0]);
    assert.equal(powBal.toNumber(), 10, 'power down failed');
    console.log('her2');
    // check balances in token contract
    let ntzBal = await token.balanceOf.call(accounts[0]);
    assert.equal(ntzBal.toNumber(), 10028, 'power down failed');
    const ts = await token.activeSupply.call();
    assert.equal(ts.toNumber(), 20000, 'config failed.');
  });

});