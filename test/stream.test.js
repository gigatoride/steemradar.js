const steemradar = require("../src");

jest.setTimeout(125000); // We have to wait some time for hunt :)

test("Detect a transfer that has an amount greater than or equal 0.199 SBD/STEEM", done => {
    let senders = null,
        receivers = null,
        min_amount = '0.199 SBD|STEEM',
        target_memo = null;
    
    steemradar.transfer.detect(senders, min_amount, receivers, target_memo, (res) => {
        steemradar.transfer.stop(); // Stop streaming after getting a result.
        expect(parseFloat(res.operations[0][1].amount)).toBeGreaterThanOrEqual(0.199);
        done();
    });
});

test("Detect public profane word", done => {

    steemradar.profane.detect(null, (res) => {
        steemradar.profane.stop(); // Stop streaming after getting a result.
        expect(Array.isArray(res)).toBeTruthy();
        done();
    });
});

test("Detect last time an account was active", done => {
    let usernames = ['utopian-io'];

    steemradar.activity.detect(usernames, (ts) => {
        steemradar.activity.stop(); // Stop streaming after getting a result.
        expect(Array.isArray(ts)).toBeTruthy();
        done();
    });
});

test("Detect the latest memo has been received by username", done => {
    let memoKey = null,
        username = 'blocktrades';
    
    steemradar.memo.detect(memoKey, username, (res) => {
        steemradar.memo.stop(); // Stop streaming after getting a result.
        expect(Array.isArray(res)).toBeTruthy();
        done();
    });
});