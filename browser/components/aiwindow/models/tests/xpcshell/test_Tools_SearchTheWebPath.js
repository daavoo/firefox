/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

do_get_profile();

const {
  SEARCH_THE_WEB_ANSWERS_PREF,
  SEARCH_THE_WEB_PATH,
  selectSearchTheWebPath,
} = ChromeUtils.importESModule(
  "moz-src:///browser/components/aiwindow/models/Tools.sys.mjs"
);

const ENDPOINT_PREF = "browser.smartwindow.endpoint";
const ENDPOINT_IS_MLPA_PREF = "browser.smartwindow.endpoint.isMLPA";
const MODEL_CHOICE_PREF = "browser.smartwindow.firstrun.modelChoice";
const STAGE_MLPA = "https://mlpa-stage.example.com/v1";

registerCleanupFunction(() => {
  for (const pref of [
    SEARCH_THE_WEB_ANSWERS_PREF,
    ENDPOINT_PREF,
    ENDPOINT_IS_MLPA_PREF,
    MODEL_CHOICE_PREF,
  ]) {
    Services.prefs.clearUserPref(pref);
  }
});

add_setup(() => {
  Services.prefs.setBoolPref(SEARCH_THE_WEB_ANSWERS_PREF, true);
});

add_task(function test_answers_on_the_default_endpoint() {
  Assert.equal(selectSearchTheWebPath(), SEARCH_THE_WEB_PATH.ANSWERS);
});

add_task(function test_no_answers_on_an_overridden_endpoint() {
  Services.prefs.setStringPref(ENDPOINT_PREF, STAGE_MLPA);
  Assert.notEqual(
    selectSearchTheWebPath(),
    SEARCH_THE_WEB_PATH.ANSWERS,
    "An endpoint not known to be MLPA may not serve answers"
  );
  Services.prefs.clearUserPref(ENDPOINT_PREF);
});

add_task(function test_answers_on_an_endpoint_marked_as_mlpa() {
  Services.prefs.setStringPref(ENDPOINT_PREF, STAGE_MLPA);
  Services.prefs.setBoolPref(ENDPOINT_IS_MLPA_PREF, true);
  Assert.equal(
    selectSearchTheWebPath(),
    SEARCH_THE_WEB_PATH.ANSWERS,
    "MLPA dev, stage or a local MLPA serves answers too"
  );
  Services.prefs.clearUserPref(ENDPOINT_PREF);
  Services.prefs.clearUserPref(ENDPOINT_IS_MLPA_PREF);
});

add_task(function test_the_custom_model_choice_never_gets_answers() {
  Services.prefs.setBoolPref(ENDPOINT_IS_MLPA_PREF, true);
  Services.prefs.setStringPref(MODEL_CHOICE_PREF, "0");
  Assert.notEqual(selectSearchTheWebPath(), SEARCH_THE_WEB_PATH.ANSWERS);
  Services.prefs.clearUserPref(MODEL_CHOICE_PREF);
  Services.prefs.clearUserPref(ENDPOINT_IS_MLPA_PREF);
});
