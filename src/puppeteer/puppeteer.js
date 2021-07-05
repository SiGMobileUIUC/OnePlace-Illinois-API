import puppeteer from "puppeteer";
const moodle = "https://learn.illinois.edu/login/other.php?saml=on&target=https%3A%2F%2Flearn.illinois.edu%2F";
const courseExplorerSearch = "https://courses.illinois.edu/search/form";

async function configureBrowser() {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: "/usr/bin/chromium",
        args: ['--no-sandbox']
    });
    return browser;
}

async function courseExplorerListQuery(query) {
    const browser = await configureBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    try {
        await page.goto(courseExplorerSearch);
    } catch (error) {
        browser.close();
        throw "There was an error running the request";
    }
    await page.waitForSelector('input[id="keyword"]')
    await page.waitForSelector('button[class="btn btn-sm btn-primary"]')
    await page.type('input[id="keyword"]', query);
    console.log(query);
    await page.click('button[class="btn btn-sm btn-primary"]');
    try {
        await page.waitForSelector('tr[role="row"]');   
    } catch (error) {
        console.log(error);
        browser.close();
        throw "The passed query did not work";
    }
    console.log("trying to find row");
    try {
        let cachedJson = await page.evaluate(() => {
            debugger;
            let rows = Array.from(document.querySelectorAll('tr[role="row"]'));
            let years = [];
            let terms = [];
            let subjects = [];
            let numbers = [];
            let names = [];
            rows.forEach((item, index) => {
                if (index === 0) {
                    return;
                }
                years.push(item.children[1].innerText);
                terms.push(item.children[2].innerText);
                let split = item.children[3].innerText.split(" ");
                subjects.push(split[0]);
                numbers.push(split[0]);
                names.push(item.children[4].innerText);
            });
            let coursesList = [];
            years.forEach((item, index) => {
                let json = `
                {
                    "year" : ${item},
                    "term" : "${terms[index]}",
                    "subjectID" : "${subjects[index]}",
                    "subjectNumber" : "${numbers[index]}",
                    "name" : "${names[index]}"
                }
                `
                coursesList.push(json);
            });
            let jsonCourses = `
            {
                "courses" : [${coursesList}]
            }`;
            return jsonCourses;
        });
        browser.close();
        return cachedJson;
    } catch (error) {
        console.log(error);
        browser.close();
        throw "There was an error running the request.";
    }
}

export {courseExplorerListQuery};







// SCRAPPED
/* async function loginMoodle(username, password) {
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

} */