import StatsTimeline from "@/components/stats/stats-timeline/do";
import StatsTiny from "@/components/stats/stats-tiny/do";
import ElectionStatsDynamic from "@/components/election/election-stats-dynamic/do";
import TownsFilter from "@/components/towns/filter/do";

import {createTimelineContent, createTinyAttendanceContent, createTimelineSeatsContent} from "@/store/helpers";

export default {
	name: 'layout-election-eu',
	props: ['about'],
	components: {
		StatsTimeline,
		StatsTiny,
		ElectionStatsDynamic,
		TownsFilter
	},
	data: function () {
		return {
			compare: [
				undefined,
				undefined,
				undefined
			],
			tick: 0
		}
	},
	computed: {
		listOfCompared: function () {
			var list = [];
			var t = this.tick;

			this.compare.forEach(c => {
				list.push(c);
			});

			return list;
		},
		dataRepublic: function () {
			return this.$store.getters.getSource('souhrny/republika/souhrn');
		},
		statsTimelineRepublic: function () {
			const fn = createTimelineContent.bind(this);
			var result = fn(this.dataRepublic.volby, [], 'eu', 'evropske-volby');

			this.$nextTick();

			return result;
		},
		statsTinyAttendanceRepublic: function () {
			const fn = createTinyAttendanceContent.bind(this);
			return fn(this.dataRepublic.volby, [], 'eu', 'evropske-volby');
		}
	},
	methods: {
		cancelCompare: function (index) {
			this.compare[index] = undefined;
			this.tick++;
		},
		select: function (attr, item) {
			var obj = {
				label: item.name
			};

			if (item.nuts && item.nuts.length === 5) {
				obj.source = 'souhrny/kraje/eu/' + item.nuts
			}

			if (item.nuts && item.nuts.length === 6) {
				obj.source = 'souhrny/okresy/eu/' + item.nuts;
				obj.label = 'okr. ' + item.name
			}

			if (item.num) {
				obj.source = 'souhrny/obce/' + item.district.nuts + '/' + item.num
			}

			this.compare[attr.index] = obj;
			this.tick++;
		}
	}
};
