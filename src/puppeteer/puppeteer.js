import puppeteer from "puppeteer";
import CustomError from "puppeteer";
const moodle = "https://learn.illinois.edu/login/other.php?saml=on&target=https%3A%2F%2Flearn.illinois.edu%2F";

async function configureBrowser() {
    const browser = await puppeteer.launch({
        headless: true,
    });
    return browser;
}

async function loginMoodle(username, password) {
    const browser = await configureBrowser();
    const shibboleth = await browser.newPage();
    await shibboleth.goto(moodle, {waitUntil: 'networkidle2'});
    
    await shibboleth.waitForSelector('label[for="urn:mace:incommon:uiuc.edu"]');
    await shibboleth.waitForSelector('input[name="Select"]');

    await shibboleth.click('label[for="urn:mace:incommon:uiuc.edu"]');
    await shibboleth.click('input[name="Select"]');

    await shibboleth.waitForSelector('input[id="j_username"]');
    await shibboleth.waitForSelector('input[id="j_password"]');

    await shibboleth.type('input[id="j_username"]', username);
    await shibboleth.type('input[id="j_password"]', password);

    await shibboleth.waitForSelector('input[type="submit"]');
    await shibboleth.click('input[type="submit"]');
    try {
        await shibboleth.waitForSelector('h2[class="alert-heading"]', {
            timeout: 1000
        });
    } catch(e) {
        console.log(e);
    }
    // debugger;
    try {
        let error = await shibboleth.evaluate(() => {
            let alert = document.querySelector('h2[class="alert-heading"]')?.innerText;
            return alert;
        });
        console.log(error);
        if (error == "Error") {
            browser.close();
            return null;
        }
    } catch (e) {
        console.log(e);
    }
    let cookies = await shibboleth.cookies();

    await browser.close();
    return cookies;

}

export {loginMoodle};