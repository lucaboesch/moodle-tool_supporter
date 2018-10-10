// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * This modules provides functionality to search the html tables
 * with a specific Input Term
 *
 * It is modular in respect to the given table (body)
 *
 * @module     tool_supporter/table_filter
 * @package    tool_supporter
 * @copyright  2017 Klara Saary
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      3.1.1
 */
define(['jquery'], function($) {

    var filterTable = function(checked_elements, otable, column){

        var filterElements = [];
        var string_value = '';
        $(checked_elements).each(function(){
            var val = $(this).val();
            if(val === ""){
                string_value = '^(?![\\s\\S])';
            }
            else {
                // Escape Regex-Characters which may be in names of categories.
                val = val.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
                // String value is added several times with different starts and endings.
                // So filter for "Teacher" does not match "non-editing teacher".
                string_value = ',' + val + '$|^' + val + ',|,' + val + ',|^' + val + '$';
            }
            filterElements.push(string_value);
        });
        var filter = filterElements.join("|");
        otable.fnFilter(filter, column, true, false, false, true);
    };

    return /** @alias module:tool_supporter/table_filter */ {

        /**
         * Filtering the table with the appropiate form!
         *
         * @method FilterEvent
         * @param searchInputName : Name of the input fields you want to use as filter parameters.
         * @param tableID : ID of the table or part of the table you want to filter
         * @param FormInput : The ID of the dropdownmenu or something similiary you want to use to filter the table
         * @param column : which column should be filtered
         */
        filterEvent: function(checkboxes, FormInput, column, tableID) {
            $(FormInput).change(function() {
                var checked_elements = $('input[name=' + checkboxes + ']:checked');
                var otable = $(tableID).dataTable();
                filterTable(checked_elements, otable, column);
            });

        },

        search_table: function(tableID, columnDropdownID, searchFieldID, columns) {
            // Initialize Dropdown - add other options than "all".
            var counter = 0;
            columns.forEach(function(element) {
                $(columnDropdownID).append($('<option>', {
                    value: counter,
                    text : element.name
                }));
                counter++;
            });

            // Apply Filter when user is typing.
            $(searchFieldID).on('keyup', actually_search);

            var previousColumn;

            // Safe last column when dropdown is clicked.
            $(columnDropdownID).on('click', function(){
                previousColumn = this.value;
            });

            // Clear previous search and apply new search.
            $(columnDropdownID).on('change', function(){
                $(tableID).dataTable().fnFilter("", previousColumn, true, false, false, true);
                actually_search();
            });

            function actually_search() {
                var otable = $(tableID).dataTable();
                var searchValue = $(searchFieldID)[0].value;
                var column = $(columnDropdownID)[0].value;

                if (column == "-1") {
                    otable.fnFilter(searchValue, null); // Search all columns.
                } else {
                    otable.fnFilter(searchValue, column, true, false, false, true); // Search a specific column.
                }
            }
        }
    };
});
